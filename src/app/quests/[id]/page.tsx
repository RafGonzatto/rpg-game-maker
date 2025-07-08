import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function QuestPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }

  const quest = await prisma.quest.findUnique({
    where: { id: params.id, userId: session.user.id },
    include: {
      requires: { include: { required: true } },
      unlocks: { include: { unlocks: true } },
      reputation: true,
    },
  });

  if (!quest) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{quest.title}</h1>
      <p className="mb-2"><b>Facção:</b> {quest.faction}</p>
      <p className="mb-2"><b>Tipo:</b> {quest.type}</p>
      <p className="mb-2"><b>Diálogo:</b> {quest.dialogo || '---'}</p>
      <div className="mb-2">
        <b>Requisitos:</b> {quest.requires.map(r => r.required.title).join(', ') || 'Nenhum'}
      </div>
      <div className="mb-2">
        <b>Desbloqueia:</b> {quest.unlocks.map(u => u.unlocks.title).join(', ') || 'Nenhum'}
      </div>
      <div className="mb-2">
        <b>Reputação:</b> {Object.entries(quest.reputation.reduce((acc, rep) => { acc[rep.faction] = rep.value; return acc; }, {} as Record<string, number>)).map(([f, v]) => `${f}: ${v}`).join(', ') || 'Nenhuma'}
      </div>
    </div>
  );
}
