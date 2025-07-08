import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar o usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Se o usuário usa OAuth (Google/GitHub), não pode alterar senha
    if (user.accounts.length > 0) {
      return NextResponse.json(
        { message: 'Usuários que fazem login via Google/GitHub não podem alterar a senha' },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem senha definida
    if (!user.password) {
      return NextResponse.json(
        { message: 'Este usuário não possui senha definida' },
        { status: 400 }
      )
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Senha atual incorreta' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Atualizar senha no banco
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
