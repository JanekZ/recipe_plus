import { useCallback, useEffect, useState } from 'react'
import ActionIcon from '../ActionIcon/ActionIcon.tsx'
import { ACTION_LABELS, UNIT_LABELS, type Recipe, type Step } from '../../api'
import { secondsToMMSS } from '../../utils/time.ts'
import './CookingMode.css'

export default function CookingMode({
  recipe,
  onClose,
}: {
  recipe: Recipe
  onClose: () => void
}) {
  const steps = recipe.steps
  const [index, setIndex] = useState(0)
  const [speed, setSpeed] = useState(1)

  const goNext = useCallback(() => setIndex((i) => i + 1), [])
  const goBack = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const finished = index >= steps.length
  const step: Step | null = finished ? null : steps[index]

  return (
    <div className="cook-overlay">
      <div className="cook-panel" role="dialog" aria-modal="true" aria-label="Tryb gotowania">
        <header className="cook-head">
          <div className="cook-head-text">
            <span className="cook-eyebrow">Gotowanie</span>
            <h2 className="cook-recipe-name">{recipe.name}</h2>
          </div>
          <button className="cook-close" type="button" onClick={onClose} title="Zakończ gotowanie">
            ✕
          </button>
        </header>

        <div className="cook-progress">
          <div className="cook-progress-bar">
            <div
              className="cook-progress-fill"
              style={{ width: `${(index / Math.max(1, steps.length)) * 100}%` }}
            />
          </div>
          <span className="cook-progress-label">
            {finished ? 'Ukończono' : `Krok ${index + 1} z ${steps.length}`}
          </span>
        </div>

        {finished && (
          <>
            <section className="cook-body cook-done">
              <span className="cook-done-mark">✓</span>
              <h3 className="cook-step-title">Gotowe. Smacznego!</h3>
              <p className="cook-done-hint">Przepis „{recipe.name}” został wykonany w całości.</p>
            </section>
            <footer className="cook-footer">
              <button
                className="cook-btn ghost"
                type="button"
                onClick={goBack}
                disabled={steps.length === 0}
              >
                ← Ostatni krok
              </button>
              <button className="cook-btn primary" type="button" onClick={onClose}>
                Zamknij
              </button>
            </footer>
          </>
        )}

        {step?.type === 'ingredient' && (
          <>
            <section className="cook-body">
              <h3 className="cook-step-title">Dodaj składniki</h3>
              <ul className="cook-items">
                {(step.items ?? []).map((it, i) => (
                  <li key={i}>
                    <span>{it.name}</span>
                    <span className="cook-qty">
                      {it.quantity} {UNIT_LABELS[it.unit]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <ManualFooter index={index} onBack={goBack} onNext={goNext} />
          </>
        )}

        {step?.type === 'description' && (
          <>
            <section className="cook-body">
              <p className="cook-description">{step.description}</p>
            </section>
            <ManualFooter index={index} onBack={goBack} onNext={goNext} />
          </>
        )}

        {step?.type === 'action' && (
          <ActionRunner
            key={index}
            step={step}
            index={index}
            speed={speed}
            onSpeedChange={setSpeed}
            onBack={goBack}
            onNext={goNext}
            onDone={goNext}
          />
        )}
      </div>
    </div>
  )
}

function ManualFooter({
  index,
  onBack,
  onNext,
}: {
  index: number
  onBack: () => void
  onNext: () => void
}) {
  return (
    <footer className="cook-footer">
      <button className="cook-btn ghost" type="button" onClick={onBack} disabled={index === 0}>
        ← Wstecz
      </button>
      <button className="cook-btn primary" type="button" onClick={onNext}>
        Dalej →
      </button>
    </footer>
  )
}

function ActionRunner({
  step,
  index,
  speed,
  onSpeedChange,
  onBack,
  onNext,
  onDone,
}: {
  step: Step
  index: number
  speed: number
  onSpeedChange: (speed: number) => void
  onBack: () => void
  onNext: () => void
  onDone: () => void
}) {
  const total = Math.max(1, step.durationSeconds ?? 1)
  const [remaining, setRemaining] = useState(total)
  const [deadline, setDeadline] = useState<number | null>(null)

  useEffect(() => {
    if (deadline === null) return
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil(((deadline - Date.now()) * speed) / 1000))
      setRemaining(left)
      if (left <= 0) {
        setDeadline(null)
        onDone()
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [deadline, speed, onDone])

  const startFrom = (seconds: number) => setDeadline(Date.now() + (seconds * 1000) / speed)

  const changeSpeed = (next: number) => {
    setDeadline((d) => (d === null ? null : Date.now() + ((d - Date.now()) * speed) / next))
    onSpeedChange(next)
  }

  const running = deadline !== null
  const started = running || remaining < total
  const elapsed = ((total - remaining) / total) * 100

  return (
    <>
      <section className="cook-body">
        <div className="cook-action-head">
          <ActionIcon action={step.action ?? 'mix'} />
          <h3 className="cook-step-title">{ACTION_LABELS[step.action ?? 'mix']}</h3>
        </div>

        <div className="cook-params">
          <span>🌡️ {step.temperatureC ?? 0}°C</span>
          <span>🔪 {step.bladeSpeed ?? 0}</span>
          <span>⏱️ {secondsToMMSS(total)}</span>
        </div>

        <div className={`cook-timer${running ? ' running' : ''}`}>
          <span className="cook-timer-value">{secondsToMMSS(remaining)}</span>
          <div className="cook-timer-bar">
            <div className="cook-timer-fill" style={{ width: `${elapsed}%` }} />
          </div>
        </div>
      </section>

      <footer className="cook-footer">
        <button className="cook-btn ghost" type="button" onClick={onBack} disabled={index === 0}>
          ← Wstecz
        </button>
        <label className="cook-speed" title="Przyspieszenie odliczania">
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={speed}
            aria-label="Przyspieszenie odliczania"
            onChange={(e) => changeSpeed(Number(e.target.value))}
          />
          <span className="cook-speed-value">{speed}×</span>
        </label>
        <div className="cook-footer-right">
          {running ? (
            <button className="cook-btn ghost" type="button" onClick={() => setDeadline(null)}>
              ⏸ Pauza
            </button>
          ) : (
            <button className="cook-btn primary" type="button" onClick={() => startFrom(remaining)}>
              {started ? '▶ Wznów' : '▶ Start'}
            </button>
          )}
          <button className="cook-btn ghost" type="button" onClick={onNext}>
            Dalej →
          </button>
        </div>
      </footer>
    </>
  )
}
