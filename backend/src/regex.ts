export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function contains(value: string) {
  return { $regex: escapeRegex(value), $options: 'i' }
}
