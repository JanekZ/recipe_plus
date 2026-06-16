import { Product } from './models/Product'

const GLOBAL_PRODUCTS: Array<{ name: string; category: string }> = [
  { name: 'Marchewka', category: 'Warzywa' },
  { name: 'Pomidor', category: 'Warzywa' },
  { name: 'Cebula', category: 'Warzywa' },
  { name: 'Ziemniak', category: 'Warzywa' },
  { name: 'Papryka', category: 'Warzywa' },
  { name: 'Czosnek', category: 'Warzywa' },
  { name: 'Mleko', category: 'Nabiał' },
  { name: 'Masło', category: 'Nabiał' },
  { name: 'Ser żółty', category: 'Nabiał' },
  { name: 'Jajko', category: 'Nabiał' },
  { name: 'Śmietana', category: 'Nabiał' },
  { name: 'Kurczak', category: 'Mięso' },
  { name: 'Wołowina', category: 'Mięso' },
  { name: 'Wieprzowina', category: 'Mięso' },
  { name: 'Łosoś', category: 'Mięso' },
  { name: 'Sól', category: 'Przyprawy' },
  { name: 'Pieprz', category: 'Przyprawy' },
  { name: 'Bazylia', category: 'Przyprawy' },
  { name: 'Oregano', category: 'Przyprawy' },
  { name: 'Mąka pszenna', category: 'Produkty sypkie' },
  { name: 'Cukier', category: 'Produkty sypkie' },
  { name: 'Ryż', category: 'Produkty sypkie' },
]

export async function seedGlobalProducts(): Promise<void> {
  const count = await Product.countDocuments({ scope: 'global' })
  if (count > 0) return
  await Product.insertMany(
    GLOBAL_PRODUCTS.map((p) => ({ ...p, scope: 'global', ownerId: null })),
  )
  console.log(`[recipe] seeded ${GLOBAL_PRODUCTS.length} global products`)
}
