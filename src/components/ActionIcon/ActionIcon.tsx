import type { ReactNode } from 'react'
import type { ActionType } from '../../api'
import './ActionIcon.css'

const ACTION_SHAPES: Record<ActionType, ReactNode> = {
  mix: (
    <>
      <path d="M3.5 10.5h17a8.5 8.5 0 0 1-17 0Z" />
      <path d="M12.6 10.4 15.4 5.2" />
      <ellipse cx="16.4" cy="3.3" rx="1.5" ry="2.1" transform="rotate(28 16.4 3.3)" />
    </>
  ),
  cook: (
    <>
      <path d="M4.5 10h15v5.5a3.5 3.5 0 0 1-3.5 3.5H8A3.5 3.5 0 0 1 4.5 15.5V10Z" />
      <path d="M3 10h18" />
      <circle cx="9" cy="6" r="1.2" />
      <circle cx="13" cy="4.4" r="1.7" />
      <circle cx="15.8" cy="7.4" r="1" />
    </>
  ),
  fry: (
    <>
      <path d="M2.5 10.8h13.2v1.6a4.8 4.8 0 0 1-4.8 4.8H7.3a4.8 4.8 0 0 1-4.8-4.8v-1.6Z" />
      <path d="M15.9 11.6h5.6" />
      <circle cx="9.1" cy="13.9" r="1.7" />
    </>
  ),
  chop: (
    <>
      <g transform="rotate(-18 12 8)">
        <rect x="3.5" y="3.4" width="10.5" height="7.4" rx="1.3" />
        <path d="M14 5.3h5.1a1.6 1.6 0 0 1 0 3.2H14" />
      </g>
      <rect x="2.6" y="15.4" width="18.8" height="3.4" rx="1.7" />
    </>
  ),
  blend: (
    <>
      <path d="M6.6 3.5h10.8l-1.2 14a2.7 2.7 0 0 1-2.7 2.4h-3a2.7 2.7 0 0 1-2.7-2.4l-1.2-14Z" />
      <path d="M7.2 8.4h9.6" />
      <path d="M9.6 13.2 14.4 16" />
      <path d="M14.4 13.2 9.6 16" />
    </>
  ),
  knead: (
    <>
      <rect x="6" y="4.4" width="12" height="4.8" rx="2.4" />
      <path d="M3 6.8h3" />
      <path d="M18 6.8h3" />
      <path d="M3.5 19.5c1.2-3.9 4.6-6.2 8.5-6.2s7.3 2.3 8.5 6.2Z" />
    </>
  ),
  steam: (
    <>
      <path d="M4.5 12.6h15V16a3.5 3.5 0 0 1-3.5 3.5H8A3.5 3.5 0 0 1 4.5 16v-3.4Z" />
      <path d="M3 12.6h18" />
      <path d="M8.4 10.2c0-1.5 1.7-1.5 1.7-3s-1.7-1.5-1.7-3" />
      <path d="M13.9 10.2c0-1.5 1.7-1.5 1.7-3s-1.7-1.5-1.7-3" />
    </>
  ),
  weigh: (
    <>
      <circle cx="12" cy="6" r="2.6" />
      <rect x="2.6" y="9.6" width="18.8" height="3.2" rx="1.4" />
      <path d="M7.6 12.8v2.3" />
      <path d="M16.4 12.8v2.3" />
      <rect x="4.6" y="15.1" width="14.8" height="4.4" rx="1.5" />
      <path d="M9.2 17.3h5.6" />
    </>
  ),
  warm: (
    <>
      <path d="M8.1 12.6V5.2a2.4 2.4 0 0 1 4.8 0v7.4a4 4 0 1 1-4.8 0Z" />
      <path d="M10.5 15V8.6" />
      <path d="M16.6 8.5a4.5 4.5 0 0 1 0 7" />
      <path d="M19 6.2a8 8 0 0 1 0 11.6" />
    </>
  ),
  rest: (
    <>
      <path d="M6.5 3.4h11" />
      <path d="M6.5 20.6h11" />
      <path d="M7.6 3.4v2.7c0 2.4 4.4 3.8 4.4 5.5s-4.4 3.1-4.4 5.5v3.5" />
      <path d="M16.4 3.4v2.7c0 2.4-4.4 3.8-4.4 5.5s4.4 3.1 4.4 5.5v3.5" />
    </>
  ),
}

export default function ActionIcon({ action }: { action: ActionType }) {
  return (
    <svg
      className="action-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ACTION_SHAPES[action]}
    </svg>
  )
}
