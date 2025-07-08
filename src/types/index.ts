import type { User, Quest, Faction, QuestType } from '@prisma/client'

export type Plan = "FREE" | "PREMIUM";

export interface QuestWithRelations extends Quest {
  requires: Quest[]
  unlocks: Quest[]
  reputation: Array<{
    faction: string
    value: number
  }>
}

export interface UserWithPlan extends User {
  plan: Plan
}

export interface FactionData {
  id: string
  name: string
  bgColor: string
  borderColor: string
}

export interface QuestFormData {
  id?: string
  title: string
  faction: string
  type: string
  dialogo?: string
  requires: string[]
  unlocks: string[]
  reputation: Record<string, number>
}

export interface QuestPosition {
  x: number
  y: number
}

export interface QuestConnection {
  source: string
  target: string
}

export type { User, Quest, Faction, QuestType }
