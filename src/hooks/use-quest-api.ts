import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
export interface Quest {
  id: string
  title: string
  faction: string
  type: string
  dialogo?: string
  requires: string[]
  unlocks: string[]
  reputation: Record<string, number>
}

export interface Faction {
  id: string
  name: string
  bgColor: string
  borderColor: string
}

export interface QuestType {
  id: string
  name: string
}

// API functions
const api = {
  quests: {
    getAll: async (): Promise<Quest[]> => {
      const res = await fetch('/api/quests')
      if (!res.ok) throw new Error('Failed to fetch quests')
      return res.json()
    },
    
    create: async (data: Omit<Quest, 'id' | 'unlocks'>): Promise<{ id: string }> => {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create quest')
      return res.json()
    },
    
    update: async ({ id, ...data }: Partial<Quest> & { id: string }): Promise<void> => {
      const res = await fetch(`/api/quests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update quest')
    },
    
    delete: async (id: string): Promise<void> => {
      const res = await fetch(`/api/quests/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete quest')
    },
  },
  
  factions: {
    getAll: async (): Promise<Faction[]> => {
      const res = await fetch('/api/factions')
      if (!res.ok) throw new Error('Failed to fetch factions')
      return res.json()
    },
    
    create: async (data: Omit<Faction, 'id'>): Promise<Faction> => {
      const res = await fetch('/api/factions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create faction')
      return res.json()
    },
  },
  
  types: {
    getAll: async (): Promise<QuestType[]> => {
      const res = await fetch('/api/types')
      if (!res.ok) throw new Error('Failed to fetch types')
      return res.json()
    },
    
    create: async (data: Omit<QuestType, 'id'>): Promise<QuestType> => {
      const res = await fetch('/api/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create type')
      return res.json()
    },
  },
}

// Hooks
export function useQuests() {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['quests'],
    queryFn: api.quests.getAll,
    enabled: !!session,
  })
}

export function useCreateQuest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.quests.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

export function useUpdateQuest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.quests.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

export function useDeleteQuest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.quests.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

export function useFactions() {
  return useQuery({
    queryKey: ['factions'],
    queryFn: api.factions.getAll,
  })
}

export function useCreateFaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.factions.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factions'] })
    },
  })
}

export function useQuestTypes() {
  return useQuery({
    queryKey: ['quest-types'],
    queryFn: api.types.getAll,
  })
}

export function useCreateQuestType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.types.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-types'] })
    },
  })
}
