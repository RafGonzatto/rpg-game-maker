import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const FactionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  bgColor: z.string().min(1, 'Cor de fundo é obrigatória'),
  borderColor: z.string().min(1, 'Cor da borda é obrigatória'),
})

export async function GET() {
  try {
    const factions = await prisma.faction.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(factions)
  } catch (error) {
    console.error('Error fetching factions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = FactionSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, bgColor, borderColor } = validation.data

    const faction = await prisma.faction.create({
      data: {
        name,
        bgColor,
        borderColor,
      },
    })

    return NextResponse.json(faction, { status: 201 })
  } catch (error) {
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Faction with this name already exists' },
        { status: 409 }
      )
    }
    
    console.error('Error creating faction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
