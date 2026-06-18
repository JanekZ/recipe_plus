import Ajv2020 from 'ajv/dist/2020'
import type { ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import type { RecipeDoc } from './models/Recipe'

export const DREAMFOODX_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://dreamfoodx.example.com/schemas/recipe-1.0.json',
  type: 'object',
  required: ['format', 'formatVersion', 'recipe'],
  additionalProperties: false,
  properties: {
    format: { const: 'dreamfoodx.recipe' },
    formatVersion: { type: 'string', pattern: '^\\d+\\.\\d+$' },
    exportedAt: { type: 'string', format: 'date-time' },
    recipe: { $ref: '#/$defs/recipe' },
  },
  $defs: {
    recipe: {
      type: 'object',
      required: ['name', 'difficulty', 'estimatedTimeSeconds', 'portions', 'ingredients', 'steps'],
      additionalProperties: false,
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 200 },
        description: { type: 'string', maxLength: 4000 },
        category: { type: 'string', maxLength: 80 },
        author: { type: 'string', maxLength: 200 },
        language: { type: 'string' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        estimatedTimeSeconds: { type: 'integer', minimum: 0 },
        portions: { type: 'integer', minimum: 1, maximum: 99 },
        ingredients: { type: 'array', items: { $ref: '#/$defs/ingredient' } },
        steps: { type: 'array', minItems: 1, items: { $ref: '#/$defs/step' } },
      },
    },
    ingredient: {
      type: 'object',
      required: ['name', 'quantity', 'unit'],
      additionalProperties: false,
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 200 },
        quantity: { type: 'number', minimum: 0 },
        unit: { type: 'string', enum: ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'pcs'] },
        custom: { type: 'boolean' },
        productId: { type: 'string' },
      },
    },
    step: {
      oneOf: [
        { $ref: '#/$defs/actionStep' },
        { $ref: '#/$defs/ingredientStep' },
        { $ref: '#/$defs/descriptionStep' },
      ],
    },
    actionStep: {
      type: 'object',
      required: ['type', 'order', 'action', 'temperatureC', 'bladeSpeed', 'durationSeconds'],
      additionalProperties: false,
      properties: {
        type: { const: 'action' },
        order: { type: 'integer', minimum: 1 },
        action: {
          type: 'string',
          enum: ['mix', 'cook', 'fry', 'chop', 'blend', 'knead', 'steam', 'weigh', 'warm', 'rest'],
        },
        temperatureC: { type: 'integer', minimum: 0, maximum: 200 },
        bladeSpeed: { type: 'integer', minimum: 0, maximum: 10 },
        durationSeconds: { type: 'integer', minimum: 1, maximum: 86400 },
      },
    },
    ingredientStep: {
      type: 'object',
      required: ['type', 'order', 'items'],
      additionalProperties: false,
      properties: {
        type: { const: 'ingredient' },
        order: { type: 'integer', minimum: 1 },
        items: { type: 'array', minItems: 1, items: { $ref: '#/$defs/ingredient' } },
      },
    },
    descriptionStep: {
      type: 'object',
      required: ['type', 'order', 'description'],
      additionalProperties: false,
      properties: {
        type: { const: 'description' },
        order: { type: 'integer', minimum: 1 },
        description: { type: 'string', minLength: 1, maxLength: 2000 },
      },
    },
  },
} as const

const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validate: ValidateFunction = ajv.compile(DREAMFOODX_SCHEMA)

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateDreamFoodX(payload: unknown): ValidationResult {
  const valid = validate(payload)
  if (valid) return { valid: true, errors: [] }
  const errors = (validate.errors ?? []).map(
    (e) => `${e.instancePath || '(root)'} ${e.message ?? 'is invalid'}`,
  )
  return { valid: false, errors }
}

export function recipeToDreamFoodX(recipe: RecipeDoc) {
  const steps = [...recipe.steps]
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      if (s.type === 'ingredient')
        return {
          type: 'ingredient',
          order: s.order,
          items: (s.items ?? []).map((it) => ({
            name: it.name,
            quantity: it.quantity,
            unit: it.unit,
            custom: !!it.custom,
          })),
        }
      if (s.type === 'description')
        return { type: 'description', order: s.order, description: s.description ?? '' }
      return {
        type: 'action',
        order: s.order,
        action: s.action,
        temperatureC: s.temperatureC,
        bladeSpeed: s.bladeSpeed,
        durationSeconds: s.durationSeconds,
      }
    })

  return {
    format: 'dreamfoodx.recipe' as const,
    formatVersion: '1.0',
    exportedAt: new Date().toISOString(),
    recipe: {
      name: recipe.name,
      description: recipe.description || '',
      category: recipe.category || 'Inne',
      author: recipe.authorName,
      language: 'pl',
      difficulty: recipe.difficulty,
      estimatedTimeSeconds: recipe.estimatedTimeSeconds || 0,
      portions: recipe.portions,
      ingredients: recipe.ingredients.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        custom: !!i.custom,
      })),
      steps,
    },
  }
}

export function dreamFoodXToRecipeInput(payload: any) {
  const r = payload.recipe
  const steps = (r.steps ?? []).map((s: any, idx: number) => {
    const order = s.order ?? idx + 1
    if (s.type === 'ingredient')
      return {
        type: 'ingredient',
        order,
        items: (s.items ?? []).map((it: any) => ({
          name: it.name,
          quantity: it.quantity,
          unit: it.unit,
          custom: !!it.custom,
          productId: it.productId,
        })),
      }
    if (s.type === 'description')
      return { type: 'description', order, description: s.description ?? '' }
    return {
      type: 'action',
      order,
      action: s.action,
      temperatureC: s.temperatureC,
      bladeSpeed: s.bladeSpeed,
      durationSeconds: s.durationSeconds,
    }
  })

  // Derive the ingredient list from ingredient steps (single source of truth),
  // flattening every product across all ingredient steps.
  const ingredients = steps
    .filter((s: any) => s.type === 'ingredient')
    .flatMap((s: any) => s.items ?? [])
    .map((it: any) => ({
      name: it.name,
      quantity: it.quantity,
      unit: it.unit,
      custom: !!it.custom,
      productId: it.productId,
    }))

  return {
    name: r.name,
    description: r.description ?? '',
    category: r.category ?? 'Inne',
    difficulty: r.difficulty,
    estimatedTimeSeconds: r.estimatedTimeSeconds ?? 0,
    portions: r.portions,
    ingredients,
    steps,
  }
}
