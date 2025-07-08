import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const faction = await prisma.faction.findUnique({ where: { id: params.id } });
  if (!faction) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(faction);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const faction = await prisma.faction.update({ where: { id: params.id }, data: body });
  return NextResponse.json(faction);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.faction.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
