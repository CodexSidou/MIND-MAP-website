import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { t } from '../../i18n'

export default function SearchDialog() {
  const open = useStore((s) => s.ui.searchOpen)
  const setUi = useStore((s) => s.setUi)
  const maps = useStore((s) => s.maps)
  const openMap = useStore((s) => s.openMap)
  const rf = useStore((s) => s.rf as { fitBounds: (b: { x: number; y: number; width: number; height: number }, o?: object) => void } | null)
  const lang = useStore((s) => s.language)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])
  if (!open) return null

  const results = useMemo(() => {
    const needle = q.toLowerCase().trim()
    if (!needle) return []
    const out: { type: 'map' | 'node'; mapId: string; nodeId?: string; title: string; sub?: string }[] = []
    for (const m of maps) {
      if (m.name.toLowerCase().includes(needle)) out.push({ type: 'map', mapId: m.id, title: m.name, sub: 'Mind map' })
      for (const n of m.nodes) {
        const hay = `${n.data.title} ${n.data.description ?? ''} ${(n.data.tags ?? []).join(' ')} ${n.data.url ?? ''}`.toLowerCase()
        if (hay.includes(needle)) out.push({ type: 'node', mapId: m.id, nodeId: n.id, title: n.data.title || 'Untitled', sub: m.name })
      }
    }
    return out.slice(0, 40)
  }, [q, maps])

  const select = (r: (typeof results)[number]) => {
    openMap(r.mapId)
    setUi({ searchOpen: false })
    if (r.nodeId) {
      setTimeout(() => {
        const map = useStore.getState().maps.find((m) => m.id === r.mapId)
        const node = map?.nodes.find((n) => n.id === r.nodeId)
        if (node) {
          useStore.setState((s) => ({
            maps: s.maps.map((m) => m.id === r.mapId ? { ...m, nodes: m.nodes.map((n) => ({ ...n, selected: n.id === r.nodeId })) } : m),
          }))
          rf?.fitBounds({ x: node.position.x - 120, y: node.position.y - 60, width: 480, height: 320 }, { duration: 500, padding: 0.3 })
        }
      }, 60)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-24" onClick={() => setUi({ searchOpen: false })}>
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setUi({ searchOpen: false }) }}
          placeholder={t(lang, 'searchPlaceholder')}
          className="w-full rounded-lg bg-gray-50 px-3 py-2.5 text-sm outline-none"
        />
        <ul className="mt-1 max-h-72 overflow-y-auto">
          {results.map((r, i) => (
            <li key={r.mapId + (r.nodeId ?? '') + i}>
              <button onClick={() => select(r)} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-blue-50">
                <span className="text-gray-800">{r.title}</span>
                {r.sub && <span className="ml-2 text-xs text-gray-400">{r.sub}</span>}
              </button>
            </li>
          ))}
          {q && results.length === 0 && <li className="px-3 py-4 text-center text-sm text-gray-400">{t(lang, 'noResults')}</li>}
        </ul>
      </div>
    </div>
  )
}
