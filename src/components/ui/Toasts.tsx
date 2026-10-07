import React from 'react'
import { useStore } from '../../store/useStore'

export default function Toasts() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed right-4 top-14 z-[60] flex flex-col items-end gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg border px-3 py-2 text-sm shadow-md ${
            t.kind === 'error' ? 'border-red-200 bg-red-50 text-red-700' : t.kind === 'info' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          ✓ {t.message}
        </div>
      ))}
    </div>
  )
}
