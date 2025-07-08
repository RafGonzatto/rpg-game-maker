import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{user.name || user.email}</h1>
      <p className="mb-2"><b>Email:</b> {user.email}</p>
      <p className="mb-2"><b>Plano:</b> {user.plan}</p>
    </div>
  );
}
