import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, type User } from '../api'
import { TOKEN_KEY } from '../api/config'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    name: string,
    lastName: string,
    nickname: string,
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password)
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    lastName: string,
    nickname: string,
  ) => {
    const { token, user } = await authApi.register(email, password, name, lastName, nickname)
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
