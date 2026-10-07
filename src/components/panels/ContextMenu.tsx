import React from 'react'
import { useStore } from '../../store/useStore'
import { t } from '../../i18n'

export default function ContextMenu() {
  const ctx = useStore((s) => s.ui.contextMenu)
  const setUi = useStore((s) => s.setUi)
  const lang = useStore((s) => s.language)
  const addNode = useStore((s) => s.addNode)
  const duplicateSelected = useStore((s) => s.duplicateSelected)
  const deleteSelected = useStore((s) => s.deleteSelected)
  const copySelected = useStore((s) => s.copySelected)
  const paste = useStore((s) => s.paste)
  const selectAll = useStore((s) => s.selectAll)
  const toggleCollapse = useStore((s) => s.toggleCollapse)
  const deleteNode = useStore((s) => s.deleteNode)
  const updateNode = useStore((s) => s.updateNode)

  if (!ctx) return null

  const close = () => setUi({ contextMenu: null })
  const at = { x: ctx.flowX, y: ctx.flowY }

  const paneItems = [
    { label: t(lang, 'createNode'), run: () => addNode('idea', at) },
    { label: t(lang, 'createNote'), run: () => addNode('note', at) },
    { label: 'Create sticky', run: () => addNode('sticky', at) },
    { label: t(lang, 'paste'), run: () => paste() },
    { label: t(lang, 'selectAll'), run: () => selectAll() },
  ]

  const nodeItems = [
    { label: t(lang, 'edit'), run: () => ctx.nodeId && updateNode(ctx.nodeId, { editing: true }) },
    { label: t(lang, 'duplicate'), run: () => duplicateSelected() },
    { label: t(lang, 'copy'), run: () => copySelected() },
    { label: 'Collapse / Expand', run: () => ctx.nodeId && toggleCollapse(ctx.nodeId) },
    { label: 'Set red', run: () => ctx.nodeId && updateNode(ctx.nodeId, { color: '#EF4444' }) },
    { label: 'Set blue', run: () => ctx.nodeId && updateNode(ctx.nodeId, { color: '#3B82F6' }) },
    { label: 'Set green', run: () => ctx.nodeId && updateNode(ctx.nodeId, { color: '#10B981' }) },
    { label: t(lang, 'delete'), run: () => ctx.nodeId && deleteNode(ctx.nodeId) },
  ]

  const edgeItems = [{ label: t(lang, 'delete'), run: () => deleteSelected() }]

  const items = ctx.target === 'pane' ? paneItems : ctx.target === 'node' ? nodeItems : edgeItems

  return (
    <div className="fixed inset-0 z-40" onClick={close} onContextMenu={(e) => { e.preventDefault(); close() }}>
      <ul className="fixed z-50 w-48 rounded-lg border border-gray-200 bg-white p-1 shadow-lg" style={{ left: ctx.x, top: ctx.y }}>
        {items.map((it) => (
          <li key={it.label}>
            <button
              onClick={() => { it.run(); close() }}
              className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
