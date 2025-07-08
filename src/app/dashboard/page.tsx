import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// This page needs to be dynamic because it uses getServerSession
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  // Buscar dados do usuário e estatísticas do backend para SSR (Premium)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, plan: true },
  })

  let stats = null
  if (user?.plan === 'PREMIUM') {
    // Buscar estatísticas do backend para o usuário
    const totalQuests = await prisma.quest.count({ where: { userId: user.id } })
    // Considera quest completa se tem pelo menos 1 unlock
    const allQuests = await prisma.quest.findMany({ where: { userId: user.id }, select: { unlocks: true, requires: true } })
    const completedQuests = allQuests.filter(q => q.unlocks && q.unlocks.length > 0).length
    const questsWithoutRequirements = allQuests.filter(q => !q.requires || q.requires.length === 0).length
    const averageRequirements = allQuests.length > 0 ? allQuests.reduce((acc, q) => acc + (q.requires ? q.requires.length : 0), 0) / allQuests.length : 0
    // Remove userId dos filtros de Faction e QuestType
    const factionsCount = await prisma.faction.count()
    const typesCount = await prisma.questType.count()
    stats = {
      totalQuests,
      completedQuests,
      questsWithoutRequirements,
      averageRequirements,
      factionsCount,
      typesCount,
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Quests
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe suas estatísticas e progresso das quests
          </p>
          <div className="mt-4 p-4 bg-white rounded shadow flex flex-col md:flex-row md:items-center gap-2">
            <div>
              <span className="font-semibold">Usuário:</span> {user?.name || session.user.name}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {user?.email || session.user.email}
            </div>
            <div>
              <span className="font-semibold">Plano:</span> {user?.plan || session.user.plan}
            </div>
          </div>
        </div>
        <DashboardStats userId={session.user.id} plan={user?.plan || 'FREE'} stats={stats} />
      </div>
    </div>
  )
}
