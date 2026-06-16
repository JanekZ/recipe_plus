import express from 'express'
import cors from 'cors'
import { connectMongo } from './db'
import { seedGlobalProducts } from './seed'
import recipesRouter from './routes/recipes'
import productsRouter from './routes/products'

const PORT = Number(process.env.PORT) || 3001

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'recipe-service' }))

app.use('/recipes', recipesRouter)
app.use('/products', productsRouter)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[recipe] unhandled error', err)
  res.status(500).json({ error: 'Internal server error' })
})

connectMongo()
  .then(seedGlobalProducts)
  .then(() => app.listen(PORT, () => console.log(`[recipe] listening on :${PORT}`)))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
