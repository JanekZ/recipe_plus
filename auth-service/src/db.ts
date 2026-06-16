import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export async function waitForDb(retries = 15, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1')
      console.log('[auth] connected to postgres')
      return
    } catch (err) {
      console.log(`[auth] postgres not ready (attempt ${attempt}/${retries})`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw new Error('[auth] could not connect to postgres')
}

export interface UserRow {
  id: string
  email: string
  password_hash: string
  name: string
  last_name: string
  nickname: string
  created_at: string
}
