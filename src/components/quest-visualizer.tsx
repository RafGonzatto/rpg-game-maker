'use client'

import { useSession, signOut } from 'next-auth/react'
import { useQuests, useFactions, useQuestTypes } from '@/hooks/use-quest-api'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { QuestNodesView } from '@/components/quest-nodes-view'
import { Badge } from '@/components/ui/badge'
import { Crown, LogOut, Database, HardDrive, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export function QuestVisualizer() {
  const { data: session } = useSession()
  
  // For API data (Premium users)
  const { data: apiQuests = [], isLoading: apiLoading } = useQuests()
  const { data: apiFactions = [] } = useFactions()
  const { data: apiTypes = [] } = useQuestTypes()
  
  // For localStorage data (Free users)
  const {
    isFreePlan,
    isLoaded,
    quests: localQuests,
    factions: localFactions,
    types: localTypes,
    addQuest: addLocalQuest,
    updateQuest: updateLocalQuest,
    deleteQuest: deleteLocalQuest,
    addFaction: addLocalFaction,
    addType: addLocalType,
  } = useLocalStorage()

  const isPremium = session?.user?.plan === 'PREMIUM'
  
  // Use the appropriate data source based on plan
  const quests = isFreePlan ? localQuests : apiQuests
  const factions = isFreePlan ? localFactions : apiFactions
  const types = isFreePlan ? localTypes : apiTypes
  const isLoadingData = isFreePlan ? !isLoaded : apiLoading

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando suas quests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Quest Visualizer with Medieval Theme */}
      <QuestNodesView
        quests={quests}
        factions={factions}
        types={types}
        isFreePlan={isFreePlan}
        onAddQuest={isFreePlan ? addLocalQuest : undefined}
        onUpdateQuest={isFreePlan ? updateLocalQuest : undefined}
        onDeleteQuest={isFreePlan ? deleteLocalQuest : undefined}
        onAddFaction={isFreePlan ? addLocalFaction : undefined}
        onAddType={isFreePlan ? (type: string) => addLocalType({ name: type }) : undefined}
      />
    </div>
  )
}
