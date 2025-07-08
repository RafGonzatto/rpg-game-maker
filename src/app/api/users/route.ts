import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  plan: z.enum(['FREE', 'PREMIUM']).default('FREE'),
});

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, plan: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users - upgrade de plano
// PATCH /api/users - upgrade de plano e retorna dados atualizados
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, plan } = body;
    if (!id || !['FREE', 'PREMIUM'].includes(plan)) {
      return NextResponse.json({ error: 'Dados inválidos para upgrade.' }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { plan },
      select: { id: true, name: true, email: true, plan: true },
    });

    // Buscar estatísticas do usuário após upgrade
    let stats = null;
    if (plan === 'PREMIUM') {
      const totalQuests = await prisma.quest.count({ where: { userId: id } });
      const allQuests = await prisma.quest.findMany({ where: { userId: id }, select: { unlocks: true, requires: true } });
      const completedQuests = allQuests.filter(q => q.unlocks && q.unlocks.length > 0).length;
      const questsWithoutRequirements = allQuests.filter(q => !q.requires || q.requires.length === 0).length;
      const averageRequirements = allQuests.length > 0 ? allQuests.reduce((acc, q) => acc + (q.requires ? q.requires.length : 0), 0) / allQuests.length : 0;
      const factionsCount = await prisma.faction.count();
      const typesCount = await prisma.questType.count();
      stats = {
        totalQuests,
        completedQuests,
        questsWithoutRequirements,
        averageRequirements,
        factionsCount,
        typesCount,
      };
    }

    return NextResponse.json({ user, stats });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar plano.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = UserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 });
    }
    const user = await prisma.user.create({ data: parsed.data });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
