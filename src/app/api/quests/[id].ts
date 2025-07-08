import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const quest = await prisma.quest.findUnique({
    where: { id: params.id, userId: session.user.id },
    include: {
      requires: { include: { required: true } },
      unlocks: { include: { unlocks: true } },
      reputation: true,
    },
  });
  if (!quest) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(quest);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const quest = await prisma.quest.update({ where: { id: params.id, userId: session.user.id }, data: body });
  return NextResponse.json(quest);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.quest.delete({ where: { id: params.id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
