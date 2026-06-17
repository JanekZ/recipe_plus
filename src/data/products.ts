export interface Product {
    id: number
    name: string
    category: string
    unit: string
}

const STORAGE_KEY = 'products'

const defaultProducts: Product[] = [
    { id: 1, name: 'Marchewka', category: 'warzywa', unit: 'kg' },
    { id: 2, name: 'Pomidor', category: 'warzywa', unit: 'kg' },
    { id: 3, name: 'Ogórek', category: 'warzywa', unit: 'szt' },
    { id: 4, name: 'Cebula', category: 'warzywa', unit: 'kg' },
    { id: 5, name: 'Papryka', category: 'warzywa', unit: 'kg' },
    { id: 6, name: 'Jabłko', category: 'owoce', unit: 'kg' },
    { id: 7, name: 'Banan', category: 'owoce', unit: 'kg' },
    { id: 8, name: 'Pomarańcza', category: 'owoce', unit: 'kg' },
    { id: 9, name: 'Truskawka', category: 'owoce', unit: 'kg' },
    { id: 10, name: 'Winogrona', category: 'owoce', unit: 'kg' },
    { id: 11, name: 'Kurczak', category: 'mięso', unit: 'kg' },
    { id: 12, name: 'Wołowina', category: 'mięso', unit: 'kg' },
    { id: 13, name: 'Wieprzowina', category: 'mięso', unit: 'kg' },
    { id: 14, name: 'Łosoś', category: 'mięso', unit: 'kg' },
]

export function getProducts(): Product[] {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        return JSON.parse(stored)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts))
    return defaultProducts
}

export function addProduct(name: string, category: string, unit: string): Product {
    const products = getProducts()
    const nextId = Math.max(...products.map(p => p.id), 0) + 1
    const product = { id: nextId, name, category, unit }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...products, product]))
    return product
}

export function deleteProduct(id: number): void {
    const products = getProducts()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products.filter(p => p.id !== id)))
}
