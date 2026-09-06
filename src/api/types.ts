export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'tsp' | 'tbsp' | 'cup' | 'pcs'

export type ActionType =
  | 'mix'
  | 'cook'
  | 'fry'
  | 'chop'
  | 'blend'
  | 'knead'
  | 'steam'
  | 'weigh'
  | 'warm'
  | 'rest'

export type Difficulty = 'easy' | 'medium' | 'hard'

export const UNITS: Unit[] = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'pcs']

export const ACTIONS: ActionType[] = [
  'mix',
  'cook',
  'fry',
  'chop',
  'blend',
  'knead',
  'steam',
  'weigh',
  'warm',
  'rest',
]

export const ACTION_LABELS: Record<ActionType, string> = {
  mix: 'Mieszanie',
  cook: 'Gotowanie',
  fry: 'Smażenie',
  chop: 'Siekanie',
  blend: 'Blendowanie',
  knead: 'Wyrabianie',
  steam: 'Gotowanie na parze',
  weigh: 'Ważenie',
  warm: 'Podgrzewanie',
  rest: 'Odpoczynek',
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
}

export const UNIT_LABELS: Record<Unit, string> = {
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'l',
  tsp: 'łyżeczka',
  tbsp: 'łyżka',
  cup: 'szklanka',
  pcs: 'szt.',
}

export interface Ingredient {
  productId?: string
  name: string
  quantity: number
  unit: Unit
  custom?: boolean
}

export type StepType = 'ingredient' | 'action' | 'description'

export const STEP_TYPES: StepType[] = ['ingredient', 'action', 'description']

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  ingredient: 'Składnikowy',
  action: 'Akcyjny',
  description: 'Opisowy',
}

export interface Step {
  type: StepType
  order: number
  action?: ActionType
  temperatureC?: number
  bladeSpeed?: number
  durationSeconds?: number
  items?: Ingredient[]
  description?: string
}

export interface Recipe {
  _id: string
  name: string
  description: string
  category: string
  image: string
  difficulty: Difficulty
  estimatedTimeSeconds: number
  portions: number
  authorId: string
  authorName: string
  isPublic: boolean
  ingredients: Ingredient[]
  steps: Step[]
  createdAt?: string
  updatedAt?: string
}

export type RecipeInput = Omit<
  Recipe,
  '_id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt'
>

export interface Product {
  _id: string
  name: string
  category: string
  scope: 'global' | 'user'
  ownerId?: string | null
}

export interface User {
  id: string
  email: string
  name: string
  lastName: string
  nickname: string
}

export interface RecipeSearchParams {
  q?: string
  category?: string
  author?: string
  ingredient?: string
}
