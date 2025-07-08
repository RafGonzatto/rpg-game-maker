import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const QuestSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  faction: z.string().min(1, 'Facção é obrigatória'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  dialogo: z.string().optional(),
  requires: z.array(z.string()).default([]),
  reputation: z.record(z.number()).default({}),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Para usuários FREE, retornar array vazio (eles usam localStorage)
    if (session.user.plan === 'FREE') {
      return NextResponse.json([])
    }

    const quests = await prisma.quest.findMany({
      where: { userId: session.user.id },
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
      orderBy: { createdAt: 'asc' },
    })

    // Transformar dados para o formato esperado pelo frontend
    const transformedQuests = quests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      faction: quest.faction,
      type: quest.type,
      dialogo: quest.dialogo,
      requires: quest.requires.map((req) => req.required.id),
      unlocks: quest.unlocks.map((unlock) => unlock.unlocks.id),
      reputation: quest.reputation.reduce((acc, rep) => {
        acc[rep.faction] = rep.value
        return acc
      }, {} as Record<string, number>),
    }))

    return NextResponse.json(transformedQuests)
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apenas usuários PREMIUM podem salvar no banco
    if (session.user.plan !== 'PREMIUM') {
      return NextResponse.json({ error: 'Premium plan required' }, { status: 403 })
    }

    const body = await request.json()
    const validation = QuestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { title, faction, type, dialogo, requires, reputation } = validation.data

    // Criar a quest
    const quest = await prisma.quest.create({
      data: {
        title,
        faction,
        type,
        dialogo,
        userId: session.user.id,
      },
    })

    // Criar relacionamentos de requisitos
    if (requires.length > 0) {
      await prisma.questRequirement.createMany({
        data: requires.map((requiredId) => ({
          questId: quest.id,
          requiredId,
        })),
      })
    }

    // Criar dados de reputação
    if (Object.keys(reputation).length > 0) {
      await prisma.questReputation.createMany({
        data: Object.entries(reputation).map(([faction, value]) => ({
          questId: quest.id,
          faction,
          value,
        })),
      })
    }

    return NextResponse.json({ id: quest.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating quest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
