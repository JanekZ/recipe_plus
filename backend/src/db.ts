import mongoose from 'mongoose'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/recipe_ingredients'

export async function connectMongo(retries = 15, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URL)
      console.log('[recipe] connected to mongodb')
      return
    } catch (err) {
      console.log(`[recipe] mongo not ready (attempt ${attempt}/${retries})`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw new Error('[recipe] could not connect to mongodb')
}
