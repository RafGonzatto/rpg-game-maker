import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Quest, Faction, QuestType } from './use-quest-api'

const STORAGE_KEYS = {
  QUESTS: 'quest-visualizer-quests',
  FACTIONS: 'quest-visualizer-factions',
  TYPES: 'quest-visualizer-types',
}

const DEFAULT_FACTIONS: Faction[] = [
  { id: '1', name: "Gangue Rival", bgColor: "#ef4444", borderColor: "#b91c1c" },
  { id: '2', name: "Negócios", bgColor: "#3b82f6", borderColor: "#1e40af" },
  { id: '3', name: "Combate", bgColor: "#10b981", borderColor: "#047857" },
  { id: '4', name: "Tutorial", bgColor: "#f59e0b", borderColor: "#d97706" },
  { id: '5', name: "Diplomacia", bgColor: "#6366f1", borderColor: "#4f46e5" },
  { id: '6', name: "Aliados", bgColor: "#8b5cf6", borderColor: "#7c3aed" },
]

const DEFAULT_TYPES: QuestType[] = [
  { id: '1', name: "Cutscene" },
  { id: '2', name: "Diálogo" },
  { id: '3', name: "Batalha" },
  { id: '4', name: "Negociação" },
  { id: '5', name: "Recrutamento" },
  { id: '6', name: "Acordo" },
]

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export function useLocalStorage() {
  const { data: session } = useSession()
  const isFreePlan = session?.user?.plan === 'FREE' || !session
  
  const [quests, setQuests] = useState<Quest[]>([])
  const [factions, setFactions] = useState<Faction[]>(DEFAULT_FACTIONS)
  const [types, setTypes] = useState<QuestType[]>(DEFAULT_TYPES)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (isFreePlan) {
      setQuests(getFromStorage(STORAGE_KEYS.QUESTS, []))
      setFactions(getFromStorage(STORAGE_KEYS.FACTIONS, DEFAULT_FACTIONS))
      setTypes(getFromStorage(STORAGE_KEYS.TYPES, DEFAULT_TYPES))
    }
    setIsLoaded(true)
  }, [isFreePlan])

  // Save to localStorage when data changes
  useEffect(() => {
    if (isLoaded && isFreePlan) {
      saveToStorage(STORAGE_KEYS.QUESTS, quests)
    }
  }, [quests, isLoaded, isFreePlan])

  useEffect(() => {
    if (isLoaded && isFreePlan) {
      saveToStorage(STORAGE_KEYS.FACTIONS, factions)
    }
  }, [factions, isLoaded, isFreePlan])

  useEffect(() => {
    if (isLoaded && isFreePlan) {
      saveToStorage(STORAGE_KEYS.TYPES, types)
    }
  }, [types, isLoaded, isFreePlan])

  const addQuest = (quest: Omit<Quest, 'id' | 'unlocks'>) => {
    if (!isFreePlan) return
    
    const id = `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newQuest: Quest = {
      ...quest,
      id,
      unlocks: [],
    }
    
    setQuests(prev => {
      const updated = [...prev, newQuest]
      // Update unlocks for required quests
      quest.requires.forEach(requiredId => {
        const index = updated.findIndex(q => q.id === requiredId)
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            unlocks: [...updated[index].unlocks, id]
          }
        }
      })
      return updated
    })
    
    return { id }
  }

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    if (!isFreePlan) return
    
    setQuests(prev => {
      return prev.map(quest => {
        if (quest.id === id) {
          const updated = { ...quest, ...updates }
          
          // If requires changed, update unlocks accordingly
          if (updates.requires) {
            // Remove this quest from old required quests' unlocks
            quest.requires.forEach(oldRequiredId => {
              const oldRequiredIndex = prev.findIndex(q => q.id === oldRequiredId)
              if (oldRequiredIndex !== -1) {
                prev[oldRequiredIndex] = {
                  ...prev[oldRequiredIndex],
                  unlocks: prev[oldRequiredIndex].unlocks.filter(unlockId => unlockId !== id)
                }
              }
            })
            
            // Add this quest to new required quests' unlocks
            updates.requires.forEach(newRequiredId => {
              const newRequiredIndex = prev.findIndex(q => q.id === newRequiredId)
              if (newRequiredIndex !== -1 && !prev[newRequiredIndex].unlocks.includes(id)) {
                prev[newRequiredIndex] = {
                  ...prev[newRequiredIndex],
                  unlocks: [...prev[newRequiredIndex].unlocks, id]
                }
              }
            })
          }
          
          return updated
        }
        return quest
      })
    })
  }

  const deleteQuest = (id: string) => {
    if (!isFreePlan) return
    
    setQuests(prev => {
      const questToDelete = prev.find(q => q.id === id)
      if (!questToDelete) return prev
      
      return prev
        .filter(q => q.id !== id)
        .map(quest => ({
          ...quest,
          requires: quest.requires.filter(reqId => reqId !== id),
          unlocks: quest.unlocks.filter(unlockId => unlockId !== id),
        }))
    })
  }

  const addFaction = (faction: Omit<Faction, 'id'>) => {
    if (!isFreePlan) return
    
    const id = `faction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newFaction: Faction = { ...faction, id }
    
    setFactions(prev => [...prev, newFaction])
    return newFaction
  }

  const addType = (type: Omit<QuestType, 'id'>) => {
    if (!isFreePlan) return
    
    const id = `type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newType: QuestType = { ...type, id }
    
    setTypes(prev => [...prev, newType])
    return newType
  }

  return {
    isFreePlan,
    isLoaded,
    quests,
    factions,
    types,
    addQuest,
    updateQuest,
    deleteQuest,
    addFaction,
    addType,
    setQuests,
    setFactions,
    setTypes,
  }
}
