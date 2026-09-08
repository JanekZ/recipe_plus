import { Router, type Response } from 'express'
import { Product } from '../models/Product'
import { requireAuth, optionalAuth, type AuthedRequest } from '../jwt'

const router = Router()

router.get('/', optionalAuth, async (req: AuthedRequest, res: Response) => {
  const { category, q } = req.query
  const visibility: any[] = [{ scope: 'global' }]
  if (req.user) visibility.push({ scope: 'user', ownerId: req.user.sub })

  const filter: any = { $or: visibility }
  if (typeof category === 'string' && category) filter.category = category
  if (typeof q === 'string' && q) filter.name = { $regex: q, $options: 'i' }

  const products = await Product.find(filter).sort({ category: 1, name: 1 }).lean()
  res.json(products)
})

router.get('/categories', optionalAuth, async (req: AuthedRequest, res: Response) => {
  const visibility: any[] = [{ scope: 'global' }]
  if (req.user) visibility.push({ scope: 'user', ownerId: req.user.sub })
  const categories = await Product.distinct('category', { $or: visibility })
  res.json(categories.sort())
})

router.post('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const { name, category } = req.body ?? {}
  if (typeof name !== 'string' || !name.trim())
    return res.status(400).json({ error: 'name is required' })
  if (typeof category !== 'string' || !category.trim())
    return res.status(400).json({ error: 'category is required' })

  const trimmedName = name.trim()
  const escaped = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const clash = await Product.findOne({
    name: { $regex: `^${escaped}$`, $options: 'i' },
    $or: [{ scope: 'global' }, { scope: 'user', ownerId: req.user!.sub }],
  })
  if (clash) return res.status(409).json({ error: 'A product with this name already exists' })

  try {
    const product = await Product.create({
      name: trimmedName,
      category: category.trim(),
      scope: 'user',
      ownerId: req.user!.sub,
    })
    res.status(201).json(product)
  } catch (err: any) {
    if (err?.code === 11000)
      return res.status(409).json({ error: 'A product with this name already exists' })
    console.error('[recipe] create product failed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/mine', requireAuth, async (req: AuthedRequest, res: Response) => {
  const result = await Product.deleteMany({ scope: 'user', ownerId: req.user!.sub })
  res.json({ deleted: result.deletedCount ?? 0 })
})

router.delete('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  if (product.scope !== 'user' || product.ownerId !== req.user!.sub)
    return res.status(403).json({ error: 'You can only delete your own products' })
  await product.deleteOne()
  res.status(204).end()
})

export default router
