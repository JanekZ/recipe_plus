import { Schema, model, type InferSchemaType } from 'mongoose'

export const ACTIONS = [
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
] as const

export const UNITS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'pcs'] as const
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
export const STEP_TYPES = ['ingredient', 'action', 'description'] as const

const IngredientSchema = new Schema(
  {
    productId: { type: String },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: UNITS, required: true },
    custom: { type: Boolean, default: false },
  },
  { _id: false },
)

const StepSchema = new Schema(
  {
    type: { type: String, enum: STEP_TYPES, required: true },
    order: { type: Number, required: true, min: 1 },

    // action steps
    action: { type: String, enum: ACTIONS },
    temperatureC: { type: Number, min: 0, max: 200 },
    bladeSpeed: { type: Number, min: 0, max: 10 },
    durationSeconds: { type: Number, min: 1, max: 86400 },

    // ingredient steps - one or more products added at this step
    items: { type: [IngredientSchema], default: undefined },

    // description steps
    description: { type: String, trim: true },
  },
  { _id: false },
)

const RecipeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, default: '' },
    category: { type: String, default: 'Inne', index: true },
    image: { type: String, default: '' },
    difficulty: { type: String, enum: DIFFICULTIES, default: 'medium' },
    estimatedTimeSeconds: { type: Number, default: 0, min: 0 },
    portions: { type: Number, default: 1, min: 1 },

    authorId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    isPublic: { type: Boolean, default: false, index: true },

    ingredients: { type: [IngredientSchema], default: [] },
    steps: { type: [StepSchema], default: [] },
  },
  { timestamps: true },
)

RecipeSchema.index({ isPublic: 1, category: 1 })

export type RecipeDoc = InferSchemaType<typeof RecipeSchema>
export const Recipe = model('Recipe', RecipeSchema)
