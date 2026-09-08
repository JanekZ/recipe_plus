export function secondsToMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export function toSeconds(minutes: number, seconds: number): number {
  const m = Number.isFinite(minutes) ? Math.max(0, Math.floor(minutes)) : 0
  const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return m * 60 + s
}

export function splitSeconds(totalSeconds: number): { minutes: number; seconds: number } {
  const s = Math.max(0, Math.floor(totalSeconds))
  return { minutes: Math.floor(s / 60), seconds: s % 60 }
}
