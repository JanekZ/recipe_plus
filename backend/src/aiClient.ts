const AI_SERVICE_URL = import.meta.env.VITE_AI_URL || "http://localhost:8000";

export interface AiGenerateInput {
  ingredients: string[];
  dishName?: string;
  language?: string;
}

export interface AiGenerateResult {
  description: string;
}

export async function generateDescription(
  input: AiGenerateInput,
): Promise<AiGenerateResult> {
  // Добавляем слеш между урлом и эндпоинтом корректно
  const res = await fetch(`${AI_SERVICE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI service responded ${res.status}: ${text}`);
  }

  return (await res.json()) as AiGenerateResult;
}
