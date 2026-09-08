import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { pool, waitForDb, type UserRow } from './db'
import { signToken, verifyToken } from './jwt'

const PORT = Number(process.env.PORT) || 3002
const SALT_ROUNDS = 10

const app = express()
app.use(cors())
app.use(express.json())

function publicUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    lastName: row.last_name,
    nickname: row.nickname,
  }
}

function claimsFor(row: UserRow) {
  return {
    sub: row.id,
    email: row.email,
    name: row.name,
    lastName: row.last_name,
    nickname: row.nickname,
  }
}

const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }))


app.post('/auth/register', async (req: Request, res: Response) => {
  const { email, password, name, lastName, nickname } = req.body ?? {}

  if (!isEmail(email)) return res.status(400).json({ error: 'A valid email is required' })
  if (typeof password !== 'string' || password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  if (typeof name !== 'string' || !name.trim())
    return res.status(400).json({ error: 'First name is required' })
  if (typeof lastName !== 'string' || !lastName.trim())
    return res.status(400).json({ error: 'Last name is required' })
  if (typeof nickname !== 'string' || !nickname.trim())
    return res.status(400).json({ error: 'Nickname is required' })

  const normalizedEmail = email.toLowerCase()
  const trimmedNickname = nickname.trim()

  try {
    const exists = await pool.query('SELECT 1 FROM users WHERE lower(email) = $1', [normalizedEmail])
    if (exists.rowCount) return res.status(409).json({ error: 'Email already registered' })

    const nickTaken = await pool.query('SELECT 1 FROM users WHERE lower(nickname) = $1', [
      trimmedNickname.toLowerCase(),
    ])
    if (nickTaken.rowCount) return res.status(409).json({ error: 'Nickname already taken' })

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (email, password_hash, name, last_name, nickname)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, password_hash, name, last_name, nickname, created_at`,
      [normalizedEmail, passwordHash, name.trim(), lastName.trim(), trimmedNickname],
    )

    const user = rows[0]
    return res.status(201).json({ token: signToken(claimsFor(user)), user: publicUser(user) })
  } catch (err: any) {
    if (err?.code === '23505') return res.status(409).json({ error: 'Email or nickname already taken' })
    console.error('[auth] register failed', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})


app.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {}
  if (!isEmail(email) || typeof password !== 'string')
    return res.status(400).json({ error: 'Email and password are required' })

  try {
    const { rows } = await pool.query<UserRow>(
      'SELECT id, email, password_hash, name, last_name, nickname, created_at FROM users WHERE lower(email) = $1',
      [email.toLowerCase()],
    )
    const user = rows[0]
    const hash = user?.password_hash ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinv'
    const ok = await bcrypt.compare(password, hash)
    if (!user || !ok) return res.status(401).json({ error: 'Invalid email or password' })

    return res.json({ token: signToken(claimsFor(user)), user: publicUser(user) })
  } catch (err) {
    console.error('[auth] login failed', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})


function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing bearer token' })
  try {
    ;(req as any).user = verifyToken(header.slice(7))
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}


app.get('/auth/me', authenticate, async (req: Request, res: Response) => {
  const claims = (req as any).user
  try {
    const { rows } = await pool.query<UserRow>(
      'SELECT id, email, password_hash, name, last_name, nickname, created_at FROM users WHERE id = $1',
      [claims.sub],
    )
    if (!rows[0]) return res.status(404).json({ error: 'User not found' })
    return res.json({ user: publicUser(rows[0]) })
  } catch (err) {
    console.error('[auth] me failed', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})


app.put('/auth/password', authenticate, async (req: Request, res: Response) => {
  const claims = (req as any).user
  const { currentPassword, newPassword } = req.body ?? {}

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string')
    return res.status(400).json({ error: 'currentPassword and newPassword are required' })
  if (newPassword.length < 8)
    return res.status(400).json({ error: 'New password must be at least 8 characters' })

  try {
    const { rows } = await pool.query<UserRow>(
      'SELECT id, email, password_hash, name, last_name, nickname, created_at FROM users WHERE id = $1',
      [claims.sub],
    )
    const user = rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })

    const ok = await bcrypt.compare(currentPassword, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' })

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id])
    return res.json({ ok: true })
  } catch (err) {
    console.error('[auth] change password failed', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/auth/account', authenticate, async (req: Request, res: Response) => {
  const claims = (req as any).user
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [claims.sub])
    return res.status(204).end()
  } catch (err) {
    console.error('[auth] delete account failed', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})


app.post('/auth/verify', (req: Request, res: Response) => {
  const token = req.body?.token
  if (typeof token !== 'string') return res.status(400).json({ error: 'token is required' })
  try {
    return res.json({ valid: true, claims: verifyToken(token) })
  } catch {
    return res.status(401).json({ valid: false })
  }
})

waitForDb()
  .then(() => app.listen(PORT, () => console.log(`[auth] listening on :${PORT}`)))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
