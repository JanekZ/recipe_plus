import { Schema, model, type InferSchemaType } from 'mongoose'

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    scope: { type: String, enum: ['global', 'user'], required: true, index: true },
    ownerId: { type: String, default: null, index: true },
  },
  { timestamps: true },
)

ProductSchema.index(
  { ownerId: 1, name: 1 },
  { unique: true, partialFilterExpression: { scope: 'user' } },
)

export type ProductDoc = InferSchemaType<typeof ProductSchema>
export const Product = model('Product', ProductSchema)
