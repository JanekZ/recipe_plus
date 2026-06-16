const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000'

export interface AiGenerateInput {
  ingredients: string[]
  dishName?: string
  language?: string
}

export interface AiGenerateResult {
  description: string
}

export async function generateDescription(input: AiGenerateInput): Promise<AiGenerateResult> {
  const res = await fetch(`${AI_SERVICE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AI service responded ${res.status}: ${text}`)
  }
  return (await res.json()) as AiGenerateResult
}
