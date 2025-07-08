import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const QuestUpdateSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  faction: z.string().min(1, 'Facção é obrigatória').optional(),
  type: z.string().min(1, 'Tipo é obrigatório').optional(),
  dialogo: z.string().optional(),
  requires: z.array(z.string()).optional(),
  reputation: z.record(z.number()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.plan !== 'PREMIUM') {
      return NextResponse.json({ error: 'Premium plan required' }, { status: 403 })
    }

    const quest = await prisma.quest.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      include: {
        requires: {
          include: {
            required: true,
          },
        },
        unlocks: {
          include: {
            unlocks: true,
          },
        },
        reputation: true,
      },
    })

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    const transformedQuest = {
      id: quest.id,
      title: quest.title,
      faction: quest.faction,
      type: quest.type,
      dialogo: quest.dialogo,
      requires: quest.requires.map((req: any) => req.required.id),
      unlocks: quest.unlocks.map((unlock: any) => unlock.unlocks.id),
      reputation: quest.reputation.reduce((acc: any, rep: any) => {
        acc[rep.faction] = rep.value
        return acc
      }, {} as Record<string, number>),
    }

    return NextResponse.json(transformedQuest)
  } catch (error) {
    console.error('Error fetching quest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.plan !== 'PREMIUM') {
      return NextResponse.json({ error: 'Premium plan required' }, { status: 403 })
    }

    const body = await request.json()
    const validation = QuestUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { title, faction, type, dialogo, requires, reputation } = validation.data

    // Verificar se a quest existe e pertence ao usuário
    const existingQuest = await prisma.quest.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
    })

    if (!existingQuest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // Atualizar quest
    await prisma.quest.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(faction && { faction }),
        ...(type && { type }),
        ...(dialogo !== undefined && { dialogo }),
      },
    })

    // Atualizar requisitos se fornecidos
    if (requires !== undefined) {
      await prisma.questRequirement.deleteMany({
        where: { questId: params.id },
      })
      
      if (requires.length > 0) {
        await prisma.questRequirement.createMany({
          data: requires.map((requiredId) => ({
            questId: params.id,
            requiredId,
          })),
        })
      }
    }

    // Atualizar reputação se fornecida
    if (reputation !== undefined) {
      await prisma.questReputation.deleteMany({
        where: { questId: params.id },
      })
      
      if (Object.keys(reputation).length > 0) {
        await prisma.questReputation.createMany({
          data: Object.entries(reputation).map(([faction, value]) => ({
            questId: params.id,
            faction,
            value,
          })),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating quest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.plan !== 'PREMIUM') {
      return NextResponse.json({ error: 'Premium plan required' }, { status: 403 })
    }

    // Verificar se a quest existe e pertence ao usuário
    const existingQuest = await prisma.quest.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
    })

    if (!existingQuest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // Deletar quest (cascade deletará relacionamentos)
    await prisma.quest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
