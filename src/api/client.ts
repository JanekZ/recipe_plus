import { TOKEN_KEY } from './config'

export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  query?: Record<string, string | undefined>
}

function buildQuery(query?: Record<string, string | undefined>): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, value)
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

/** Build a typed fetch client bound to one microservice's base URL. */
export function makeClient(baseUrl: string) {
  return async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {}
    let body: string | undefined

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(options.body)
    }
    if (options.auth) {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(baseUrl + path + buildQuery(options.query), {
      method: options.method ?? 'GET',
      headers,
      body,
    })

    if (res.status === 204) return undefined as T
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const message = (data && (data.error || data.message)) || res.statusText
      throw new ApiError(message, res.status, data?.details)
    }
    return data as T
  }
}
