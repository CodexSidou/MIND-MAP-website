import React, { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { t } from '../../i18n'
import type { Priority, Status } from '../../types'

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280']
const STATUSES: Status[] = ['none', 'todo', 'in-progress', 'done', 'blocked']
const PRIORITIES: Priority[] = ['none', 'low', 'medium', 'high']

export default function PropertiesPanel() {
  const maps = useStore((s) => s.maps)
  const activeMapId = useStore((s) => s.activeMapId)
  const updateNode = useStore((s) => s.updateNode)
  const updateEdge = useStore((s) => s.updateEdge)
  const deleteNode = useStore((s) => s.deleteNode)
  const deleteSelected = useStore((s) => s.deleteSelected)
  const lang = useStore((s) => s.language)
  const active = maps.find((m) => m.id === activeMapId)

  const selectedNodes = active?.nodes.filter((n) => n.selected) ?? []
  const selectedEdges = active?.edges.filter((e) => e.selected) ?? []

  if (!active || (selectedNodes.length === 0 && selectedEdges.length === 0)) return null

  if (selectedEdges.length > 0 && selectedNodes.length === 0) {
    const e = selectedEdges[0]
    return (
      <Panel title="Connection">
        <label className="text-xs text-gray-500">Label</label>
        <input
          value={typeof e.label === 'string' ? e.label : ''}
          onChange={(ev) => updateEdge(e.id, { label: ev.target.value })}
          className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
        />
        <button onClick={() => useStore.setState((s) => ({ maps: s.maps.map((m) => m.id === s.activeMapId ? { ...m, edges: m.edges.filter((x) => x.id !== e.id) } : m) }))} className="mt-3 w-full rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
          {t(lang, 'delete')}
        </button>
      </Panel>
    )
  }

  const node = selectedNodes[0]
  const multi = selectedNodes.length > 1

  return (
    <Panel title={multi ? `${selectedNodes.length} selected` : 'Node'}>
      {!multi && (
        <>
          <Field label={t(lang, 'title')}>
            <input
              value={node.data.title}
              onChange={(e) => updateNode(node.id, { title: e.target.value })}
              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
            />
          </Field>
          <Field label={t(lang, 'description')}>
            <textarea
              rows={3}
              value={node.data.description ?? ''}
              onChange={(e) => updateNode(node.id, { description: e.target.value })}
              className="w-full resize-none rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
            />
          </Field>
          {(node.data.kind === 'project' || node.data.kind === 'goal') && (
            <Field label="Progress">
              <input
                type="number" min={0} max={100}
                value={node.data.progress ?? 0}
                onChange={(e) => updateNode(node.id, { progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
              />
            </Field>
          )}
          {node.data.kind === 'link' && (
            <Field label="URL">
              <input
                value={node.data.url ?? ''}
                onChange={(e) => updateNode(node.id, { url: e.target.value })}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
              />
            </Field>
          )}
          {(node.data.kind === 'task' || node.data.kind === 'project' || node.data.kind === 'goal') && (
            <Field label={t(lang, 'status')}>
              <select
                value={node.data.status ?? 'none'}
                onChange={(e) => updateNode(node.id, { status: e.target.value as Status })}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          )}
          {(node.data.kind === 'task' || node.data.kind === 'project') && (
            <Field label={t(lang, 'priority')}>
              <select
                value={node.data.priority ?? 'none'}
                onChange={(e) => updateNode(node.id, { priority: e.target.value as Priority })}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          )}
          <Field label={t(lang, 'tags')}>
            <input
              value={(node.data.tags ?? []).join(', ')}
              onChange={(e) => updateNode(node.id, { tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              placeholder="react, web"
              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
            />
          </Field>
        </>
      )}
      <Field label={t(lang, 'color')}>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              aria-label={`Color ${c}`}
              onClick={() => selectedNodes.forEach((n) => updateNode(n.id, { color: c }))}
              className="h-5 w-5 rounded-full border border-gray-200 transition-transform hover:scale-110"
              style={{ background: c }}
            />
          ))}
        </div>
      </Field>
      {!multi && (
        <Field label="Icon">
          <div className="flex flex-wrap gap-1">
            {['💡', '🎯', '🚀', '🎨', '💻', '🧪', '📈', '📝', '✅', '❓', '⚠️', '⭐', '🔥', '📦', '🧊', '❗'].map((e) => (
              <button
                key={e}
                aria-label={`Set icon ${e}`}
                onClick={() => updateNode(node.id, { icon: e })}
                className={`rounded p-0.5 text-base hover:bg-gray-100 ${node.data.icon === e ? 'bg-blue-100' : ''}`}
              >
                {e}
              </button>
            ))}
            <button aria-label="Clear icon" onClick={() => updateNode(node.id, { icon: '' })} className="rounded p-0.5 text-xs text-gray-400 hover:bg-gray-100">✕</button>
          </div>
        </Field>
      )}
      <button
        onClick={() => (multi ? deleteSelected() : deleteNode(node.id))}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 size={14} /> {t(lang, 'delete')}
      </button>
    </Panel>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="absolute right-2 top-2 z-20 w-64 max-h-[85%] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-lg md:right-3 max-md:left-2 max-md:right-2 max-md:top-auto max-md:bottom-2 max-md:max-h-[45%] max-md:w-auto">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </aside>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-xs text-gray-500">{label}</span>
      {children}
    </label>
  )
}
