import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const TypeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})

export async function GET() {
  try {
    const types = await prisma.questType.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(types)
  } catch (error) {
    console.error('Error fetching types:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = TypeSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name } = validation.data

    const type = await prisma.questType.create({
      data: { name },
    })

    return NextResponse.json(type, { status: 201 })
  } catch (error) {
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Type with this name already exists' },
        { status: 409 }
      )
    }
    
    console.error('Error creating type:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
