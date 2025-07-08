'use client'

import { useSession } from 'next-auth/react'
import { useQuests, useFactions, useQuestTypes } from '@/hooks/use-quest-api'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Trophy, Users, Zap, Target, Crown } from 'lucide-react'

interface DashboardStatsProps {
  userId: string
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const { data: session } = useSession()
  const isFreePlan = session?.user?.plan === 'FREE' || !session

  // API data for Premium users
  const { data: apiQuests = [] } = useQuests()
  const { data: apiFactions = [] } = useFactions()
  const { data: apiTypes = [] } = useQuestTypes()

  // Local storage data for Free users
  const {
    quests: localQuests,
    factions: localFactions,
    types: localTypes,
  } = useLocalStorage()

  // Use appropriate data source
  const quests = isFreePlan ? localQuests : apiQuests
  const factions = isFreePlan ? localFactions : apiFactions
  const types = isFreePlan ? localTypes : apiTypes

  // Calculate statistics
  const totalQuests = quests.length
  const completedQuests = quests.filter(q => q.unlocks && q.unlocks.length > 0).length
  const questsWithoutRequirements = quests.filter(q => q.requires.length === 0).length
  const averageRequirements = totalQuests > 0 
    ? quests.reduce((acc, q) => acc + q.requires.length, 0) / totalQuests 
    : 0

  // Faction distribution
  const factionStats = factions.map(faction => ({
    name: faction.name,
    count: quests.filter(q => q.faction === faction.name).length,
    color: faction.bgColor,
  }))

  // Type distribution
  const typeStats = types.map(type => ({
    name: type.name,
    count: quests.filter(q => q.type === type.name).length,
  }))

  const statsCards = [
    {
      title: 'Total de Quests',
      value: totalQuests,
      icon: Target,
      description: 'Quests criadas',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Quests Iniciais',
      value: questsWithoutRequirements,
      icon: Zap,
      description: 'Sem pré-requisitos',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Facções Ativas',
      value: factions.length,
      icon: Users,
      description: 'Facções criadas',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tipos de Quest',
      value: types.length,
      icon: BarChart3,
      description: 'Tipos disponíveis',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isFreePlan ? (
              <>
                <Trophy className="w-5 h-5 text-gray-500" />
                Status do Plano
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 text-yellow-500" />
                Status Premium
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={isFreePlan ? "secondary" : "default"}>
                {isFreePlan ? 'FREE' : 'PREMIUM'}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                {isFreePlan 
                  ? 'Dados salvos localmente no navegador'
                  : 'Dados sincronizados na nuvem'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{totalQuests}</p>
              <p className="text-sm text-gray-600">quests criadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Faction Distribution */}
      {factionStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Facção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {factionStats.map((faction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: faction.color }}
                    />
                    <span className="font-medium">{faction.name}</span>
                  </div>
                  <Badge variant="outline">{faction.count} quests</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type Distribution */}
      {typeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {typeStats.map((type, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{type.count}</p>
                  <p className="text-sm text-gray-600">{type.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {averageRequirements.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Média de pré-requisitos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {questsWithoutRequirements}
              </p>
              <p className="text-sm text-gray-600">Quests iniciais</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {totalQuests - questsWithoutRequirements}
              </p>
              <p className="text-sm text-gray-600">Quests com pré-requisitos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
