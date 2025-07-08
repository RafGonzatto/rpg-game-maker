import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function FactionPage({ params }: { params: { id: string } }) {
  const faction = await prisma.faction.findUnique({
    where: { id: params.id },
  });

  if (!faction) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{faction.name}</h1>
      <p className="mb-2"><b>Cor de fundo:</b> {faction.bgColor}</p>
      <p className="mb-2"><b>Cor da borda:</b> {faction.borderColor}</p>
    </div>
  );
}
