import { Router, type Response } from 'express'
import { isValidObjectId } from 'mongoose'
import { Recipe, ACTIONS, UNITS, DIFFICULTIES, STEP_TYPES } from '../models/Recipe'
import { requireAuth, optionalAuth, type AuthedRequest } from '../jwt'
import {
  validateDreamFoodX,
  recipeToDreamFoodX,
  dreamFoodXToRecipeInput,
} from '../dreamfoodx'
import { generateDescription } from '../aiClient'

const router = Router()

function normalizeRecipeInput(body: any): { value?: any; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Body must be an object' }
  if (typeof body.name !== 'string' || !body.name.trim()) return { error: 'name is required' }

  const rawSteps = Array.isArray(body.steps) ? body.steps : []
  const steps: any[] = []
  for (const [i, s] of rawSteps.entries()) {
    const type = s?.type
    if (!STEP_TYPES.includes(type)) return { error: `step ${i + 1}: invalid or missing type` }
    const order = i + 1

    if (type === 'action') {
      if (!ACTIONS.includes(s.action)) return { error: `step ${i + 1}: invalid action` }
      if (!Number.isInteger(s.temperatureC) || s.temperatureC < 0 || s.temperatureC > 200)
        return { error: `step ${i + 1}: temperatureC must be an integer 0–200` }
      if (!Number.isInteger(s.bladeSpeed) || s.bladeSpeed < 0 || s.bladeSpeed > 10)
        return { error: `step ${i + 1}: bladeSpeed must be an integer 0–10` }
      if (!Number.isInteger(s.durationSeconds) || s.durationSeconds < 1)
        return { error: `step ${i + 1}: durationSeconds must be a positive integer` }
      steps.push({
        type,
        order,
        action: s.action,
        temperatureC: s.temperatureC,
        bladeSpeed: s.bladeSpeed,
        durationSeconds: s.durationSeconds,
      })
    } else if (type === 'ingredient') {
      const rawItems = Array.isArray(s.items) ? s.items : []
      if (rawItems.length === 0)
        return { error: `step ${i + 1}: add at least one product` }
      const items: any[] = []
      for (const [j, it] of rawItems.entries()) {
        if (typeof it?.name !== 'string' || !it.name.trim())
          return { error: `step ${i + 1}, product ${j + 1}: name is required` }
        if (typeof it?.quantity !== 'number' || it.quantity < 0)
          return { error: `step ${i + 1}, product ${j + 1}: quantity must be non-negative` }
        if (!UNITS.includes(it?.unit))
          return { error: `step ${i + 1}, product ${j + 1}: invalid unit` }
        items.push({
          name: it.name.trim(),
          quantity: it.quantity,
          unit: it.unit,
          custom: !!it.custom,
          productId: it.productId,
        })
      }
      steps.push({ type, order, items })
    } else {
      if (typeof s.description !== 'string' || !s.description.trim())
        return { error: `step ${i + 1}: description is required` }
      steps.push({ type, order, description: s.description.trim() })
    }
  }

  const ingredients = steps
    .filter((s) => s.type === 'ingredient')
    .flatMap((s) => s.items as any[])
    .map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unit: it.unit,
      custom: !!it.custom,
      productId: it.productId,
    }))

  const difficulty = DIFFICULTIES.includes(body.difficulty) ? body.difficulty : 'medium'

  const value = {
    name: body.name.trim(),
    description: typeof body.description === 'string' ? body.description : '',
    category: typeof body.category === 'string' && body.category ? body.category : 'Inne',
    image: typeof body.image === 'string' ? body.image : '',
    difficulty,
    estimatedTimeSeconds: Number.isFinite(body.estimatedTimeSeconds) ? body.estimatedTimeSeconds : 0,
    portions: Number.isInteger(body.portions) && body.portions > 0 ? body.portions : 1,
    isPublic: !!body.isPublic,
    ingredients,
    steps,
  }
  return { value }
}

router.get('/', async (req, res: Response) => {
  const { q, category, author, ingredient } = req.query
  const filter: any = { isPublic: true }

  if (typeof q === 'string' && q) filter.name = { $regex: q, $options: 'i' }
  if (typeof category === 'string' && category) filter.category = { $regex: category, $options: 'i' }
  if (typeof author === 'string' && author) filter.authorName = { $regex: author, $options: 'i' }
  if (typeof ingredient === 'string' && ingredient)
    filter['ingredients.name'] = { $regex: ingredient, $options: 'i' }

  const recipes = await Recipe.find(filter).sort({ createdAt: -1 }).limit(100).lean()
  res.json(recipes)
})

router.get('/mine', requireAuth, async (req: AuthedRequest, res: Response) => {
  const recipes = await Recipe.find({ authorId: req.user!.sub }).sort({ createdAt: -1 }).lean()
  res.json(recipes)
})

router.delete('/mine', requireAuth, async (req: AuthedRequest, res: Response) => {
  const result = await Recipe.deleteMany({ authorId: req.user!.sub })
  res.json({ deleted: result.deletedCount ?? 0 })
})

router.post('/import', requireAuth, async (req: AuthedRequest, res: Response) => {
  const { valid, errors } = validateDreamFoodX(req.body)
  if (!valid) return res.status(400).json({ error: 'Invalid DreamFoodX file', details: errors })

  const input = dreamFoodXToRecipeInput(req.body)
  const recipe = await Recipe.create({
    ...input,
    isPublic: false, // imported recipes start private
    authorId: req.user!.sub,
    authorName: req.user!.nickname ?? req.user!.name,
  })
  res.status(201).json(recipe)
})

router.post('/ai/describe', requireAuth, async (req: AuthedRequest, res: Response) => {
  const { ingredients, dishName, language } = req.body ?? {}
  if (!Array.isArray(ingredients) || ingredients.length === 0)
    return res.status(400).json({ error: 'ingredients (non-empty array) is required' })
  try {
    const result = await generateDescription({
      ingredients: ingredients.map(String),
      dishName,
      language,
    })
    res.json({ description: result.description })
  } catch (err) {
    console.error('[recipe] ai describe failed', err)
    res.status(502).json({ error: 'AI service unavailable' })
  }
})

router.get('/:id', optionalAuth, async (req: AuthedRequest, res: Response) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Recipe not found' })
  const recipe = await Recipe.findById(req.params.id).lean()
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' })
  if (!recipe.isPublic && recipe.authorId !== req.user?.sub)
    return res.status(403).json({ error: 'This recipe is private' })
  res.json(recipe)
})

router.get('/:id/export', optionalAuth, async (req: AuthedRequest, res: Response) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Recipe not found' })
  const recipe = await Recipe.findById(req.params.id).lean()
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' })
  if (!recipe.isPublic && recipe.authorId !== req.user?.sub)
    return res.status(403).json({ error: 'This recipe is private' })

  const envelope = recipeToDreamFoodX(recipe as any)
  const filename = `${recipe.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.dreamfoodx.json`
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.json(envelope)
})

router.post('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const { value, error } = normalizeRecipeInput(req.body)
  if (error) return res.status(400).json({ error })
  const recipe = await Recipe.create({
    ...value,
    authorId: req.user!.sub,
    authorName: req.user!.nickname ?? req.user!.name,
  })
  res.status(201).json(recipe)
})

router.put('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Recipe not found' })
  const recipe = await Recipe.findById(req.params.id)
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' })
  if (recipe.authorId !== req.user!.sub)
    return res.status(403).json({ error: 'You can only edit your own recipes' })

  const { value, error } = normalizeRecipeInput(req.body)
  if (error) return res.status(400).json({ error })

  recipe.set(value)
  await recipe.save()
  res.json(recipe)
})

router.delete('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Recipe not found' })
  const recipe = await Recipe.findById(req.params.id)
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' })
  if (recipe.authorId !== req.user!.sub)
    return res.status(403).json({ error: 'You can only delete your own recipes' })
  await recipe.deleteOne()
  res.status(204).end()
})

export default router
