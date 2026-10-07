import React from 'react'
import { useStore } from '../../store/useStore'
import { templates } from '../../templates'

export default function TemplatesDialog() {
  const open = useStore((s) => s.ui.templatesOpen)
  const setUi = useStore((s) => s.setUi)
  const createMap = useStore((s) => s.createMap)
  const toast = useStore((s) => s.toast)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setUi({ templatesOpen: false })}>
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-gray-800">Templates</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => { createMap(tpl.name, tpl.icon, tpl.id); setUi({ templatesOpen: false }); toast('Template added') }}
              className="rounded-lg border border-gray-200 p-3 text-left text-sm transition hover:border-blue-300 hover:bg-blue-50/40"
            >
              <div className="text-xl">{tpl.icon}</div>
              <div className="mt-1 font-medium text-gray-700">{tpl.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
