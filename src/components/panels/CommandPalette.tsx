import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { t } from '../../i18n'

interface Command { id: string; label: string; run: () => void }

export default function CommandPalette() {
  const open = useStore((s) => s.ui.commandOpen)
  const setUi = useStore((s) => s.setUi)
  const lang = useStore((s) => s.language)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = useMemo(() => {
    const s = useStore.getState()
    const center = () => {
      const rf = s.rf as { screenToFlowPosition: (p: { x: number; y: number }) => { x: number; y: number }; getViewport: () => { x: number; y: number; zoom: number } } | null
      if (!rf) return { x: 0, y: 0 }
      const v = rf.getViewport()
      return { x: (-v.x + window.innerWidth / 2) / v.zoom, y: (-v.y + window.innerHeight / 2) / v.zoom }
    }
    const add = (kind: Parameters<typeof s.addNode>[0]) => () => { s.addNode(kind, center()) }
    return [
      { id: 'node', label: 'Create node', run: add('idea') },
      { id: 'task', label: 'Create task', run: add('task') },
      { id: 'note', label: 'Create note', run: add('note') },
      { id: 'sticky', label: 'Create sticky note', run: add('sticky') },
      { id: 'frame', label: 'Create frame', run: add('frame') },
      { id: 'conn', label: 'Create connection (select two nodes via Connect tool)', run: () => s.setTool('connect') },
      { id: 'dup', label: 'Duplicate', run: () => s.duplicateSelected() },
      { id: 'del', label: 'Delete', run: () => s.deleteSelected() },
      { id: 'fit', label: 'Zoom to fit', run: () => (s.rf as { fitView: (o?: object) => void })?.fitView({ padding: 0.2 }) },
      { id: 'sel', label: 'Zoom to selection', run: () => (s.rf as { fitView: (o?: object) => void })?.fitView({ padding: 0.3, nodes: [] }) },
      { id: 'grid', label: 'Toggle grid', run: () => s.toggleGridType() },
      { id: 'mini', label: 'Toggle minimap', run: () => s.toggleMinimap() },
      { id: 'export', label: 'Open settings → Export', run: () => s.setUi({ settingsOpen: true }) },
      { id: 'import', label: 'Import JSON (use top bar upload)', run: () => s.toast('Use the upload icon in the top bar', 'info') },
      { id: 'settings', label: 'Open settings', run: () => s.setUi({ settingsOpen: true }) },
    ]
  }, [])

  const filtered = useMemo(() => {
    if (!q) return commands
    return commands
      .map((c) => ({ c, score: fuzzy(q, c.label) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.c)
  }, [q, commands])

  useEffect(() => { setIdx(0) }, [q])
  useEffect(() => { if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])

  if (!open) return null

  const run = (c: Command) => { c.run(); setUi({ commandOpen: false }) }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-24" onClick={() => setUi({ commandOpen: false })}>
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setIdx((i) => Math.min(i + 1, filtered.length - 1))
            else if (e.key === 'ArrowUp') setIdx((i) => Math.max(i - 1, 0))
            else if (e.key === 'Enter' && filtered[idx]) run(filtered[idx])
            else if (e.key === 'Escape') setUi({ commandOpen: false })
          }}
          placeholder={t(lang, 'searchCommands')}
          className="w-full rounded-lg bg-gray-50 px-3 py-2.5 text-sm outline-none"
        />
        <ul className="mt-1 max-h-72 overflow-y-auto">
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                onMouseEnter={() => setIdx(i)}
                onClick={() => run(c)}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm ${i === idx ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                {c.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="px-3 py-4 text-center text-sm text-gray-400">{t(lang, 'noResults')}</li>}
        </ul>
      </div>
    </div>
  )
}

function fuzzy(q: string, text: string): number {
  const a = q.toLowerCase()
  const b = text.toLowerCase()
  if (b.includes(a)) return 100 - (b.indexOf(a))
  let i = 0
  let score = 0
  for (const ch of b) {
    if (ch === a[i]) { score += 1; i++; if (i === a.length) return score }
  }
  return 0
}
