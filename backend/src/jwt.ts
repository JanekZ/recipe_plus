import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me'

export interface TokenClaims {
  sub: string
  email: string
  name: string
  lastName: string
  nickname: string
}

export interface AuthedRequest extends Request {
  user?: TokenClaims
}

function readToken(req: Request): TokenClaims | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.slice(7), JWT_SECRET) as TokenClaims
  } catch {
    return null
  }
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const claims = readToken(req)
  if (!claims) return res.status(401).json({ error: 'Authentication required' })
  req.user = claims
  next()
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const claims = readToken(req)
  if (claims) req.user = claims
  next()
}
