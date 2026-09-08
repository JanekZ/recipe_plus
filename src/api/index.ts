import { API_URL, AUTH_URL } from './config'
import { makeClient } from './client'
import type {
  Product,
  Recipe,
  RecipeInput,
  RecipeSearchParams,
  User,
} from './types'

const auth = makeClient(AUTH_URL)
const recipes = makeClient(API_URL)

export const authApi = {
  register: (
    email: string,
    password: string,
    name: string,
    lastName: string,
    nickname: string,
  ) =>
    auth<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: { email, password, name, lastName, nickname },
    }),
  login: (email: string, password: string) =>
    auth<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  me: () => auth<{ user: User }>('/auth/me', { auth: true }),
  changePassword: (currentPassword: string, newPassword: string) =>
    auth<{ ok: true }>('/auth/password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
      auth: true,
    }),
  deleteAccount: () => auth<void>('/auth/account', { method: 'DELETE', auth: true }),
}

export const recipeApi = {
  search: (params: RecipeSearchParams = {}) =>
    recipes<Recipe[]>('/recipes', { query: params as Record<string, string | undefined> }),
  mine: () => recipes<Recipe[]>('/recipes/mine', { auth: true }),
  deleteMine: () => recipes<{ deleted: number }>('/recipes/mine', { method: 'DELETE', auth: true }),
  get: (id: string) => recipes<Recipe>(`/recipes/${id}`, { auth: true }),
  create: (input: RecipeInput) =>
    recipes<Recipe>('/recipes', { method: 'POST', body: input, auth: true }),
  update: (id: string, input: RecipeInput) =>
    recipes<Recipe>(`/recipes/${id}`, { method: 'PUT', body: input, auth: true }),
  remove: (id: string) =>
    recipes<void>(`/recipes/${id}`, { method: 'DELETE', auth: true }),
  importFile: (envelope: unknown) =>
    recipes<Recipe>('/recipes/import', { method: 'POST', body: envelope, auth: true }),
  exportUrl: (id: string) => `${API_URL}/recipes/${id}/export`,
  describe: (ingredients: string[], dishName?: string) =>
    recipes<{ description: string }>('/recipes/ai/describe', {
      method: 'POST',
      body: { ingredients, dishName, language: 'pl' },
      auth: true,
    }),
}

export const productApi = {
  list: (params: { category?: string; q?: string } = {}) =>
    recipes<Product[]>('/products', { query: params, auth: true }),
  categories: () => recipes<string[]>('/products/categories', { auth: true }),
  create: (name: string, category: string) =>
    recipes<Product>('/products', { method: 'POST', body: { name, category }, auth: true }),
  remove: (id: string) =>
    recipes<void>(`/products/${id}`, { method: 'DELETE', auth: true }),
  deleteMine: () =>
    recipes<{ deleted: number }>('/products/mine', { method: 'DELETE', auth: true }),
}

export * from './types'
export { ApiError } from './client'
