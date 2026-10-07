import React, { memo, useEffect, useRef, useState } from 'react'
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react'
import {
  Link as LinkIcon, Image as ImageIcon, CheckSquare, Square, Star, HelpCircle,
  GitBranch, Circle as CircleIcon, Square as SquareIcon, Folder,
} from 'lucide-react'
import type { MindNode, Priority, Status } from '../../types'
import { useStore } from '../../store/useStore'
import { sanitizeUrl } from '../../lib/utils/sanitize'

const KIND_ICON: Record<string, React.ReactNode> = {
  idea: <span className="text-sm">💡</span>,
  task: <CheckSquare size={13} className="text-blue-600" />,
  note: <span className="text-sm">📝</span>,
  project: <Folder size={13} className="text-blue-600" />,
  goal: <span className="text-sm">🎯</span>,
  question: <HelpCircle size={13} className="text-blue-600" />,
  decision: <GitBranch size={13} className="text-blue-600" />,
  link: <LinkIcon size={13} className="text-blue-600" />,
  image: <ImageIcon size={13} className="text-blue-600" />,
  text: null,
  sticky: null,
  checklist: <CheckSquare size={13} className="text-blue-600" />,
  'shape-rect': <SquareIcon size={13} className="text-gray-400" />,
  'shape-circle': <CircleIcon size={13} className="text-gray-400" />,
  frame: null,
}

const PRIORITY_COLOR: Record<Priority, string> = {
  none: 'bg-gray-100 text-gray-500',
  low: 'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-600',
  high: 'bg-red-50 text-red-600',
}

const STATUS_LABEL: Record<Status, string> = {
  none: '',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
  blocked: 'Blocked',
}

function EditableText({
  id, value, className, onCommit,
}: { id: string; value: string; className?: string; onCommit: (v: string) => void }) {
  const [v, setV] = useState(value)
  useEffect(() => setV(value), [value])
  return (
    <textarea
      autoFocus
      value={v}
      rows={2}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onCommit(v)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCommit(v)
        e.stopPropagation()
      }}
      className={`w-full resize-none rounded-md border border-blue-200 bg-white p-1 text-sm outline-none ${className ?? ''}`}
    />
  )
}

function MindNodeComponent({ id, data, selected }: NodeProps<MindNode>) {
  const updateNode = useStore((s) => s.updateNode)
  const toggleCollapse = useStore((s) => s.toggleCollapse)

  if (data.kind === 'frame') {
    return (
      <div
        className={`relative h-full w-full rounded-xl border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-gray-50/60 p-3`}
        style={{ background: data.color ? `${data.color}33` : undefined }}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{data.title || 'Frame'}</div>
        <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-gray-300" />
        <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-gray-300" />
        <NodeResizer isVisible={selected} minWidth={120} minHeight={80} lineClassName="!border-blue-400" handleClassName="!bg-blue-500 !h-2 !w-2" />
      </div>
    )
  }

  if (data.kind === 'shape-rect' || data.kind === 'shape-circle') {
    const shape = (
      <div
        className={`h-full w-full border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} ${data.kind === 'shape-circle' ? 'rounded-full' : 'rounded-lg'}`}
        style={{ background: data.color ?? '#FFFFFF' }}
      />
    )
    return (
      <div className="h-full w-full" style={{ minWidth: 80, minHeight: 60 }}>
        {shape}
        <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-gray-300" />
        <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-gray-300" />
        <NodeResizer isVisible={selected} minWidth={40} minHeight={40} lineClassName="!border-blue-400" handleClassName="!bg-blue-500 !h-2 !w-2" />
      </div>
    )
  }

  if (data.kind === 'sticky') {
    return (
      <div
        className={`h-full w-full rounded-md p-3 shadow-sm ${selected ? 'ring-2 ring-blue-500' : ''}`}
        style={{ background: data.color ?? '#FEF9C3' }}
      >
        {data.editing ? (
          <EditableText id={id} value={data.title} onCommit={(v) => updateNode(id, { title: v, editing: false })} />
        ) : (
          <div onDoubleClick={() => updateNode(id, { editing: true })} className="min-h-[40px] whitespace-pre-wrap text-sm text-gray-800">{data.title || '…'}</div>
        )}
        <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-gray-300" />
        <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-gray-300" />
        <NodeResizer isVisible={selected} minWidth={100} minHeight={80} lineClassName="!border-blue-400" handleClassName="!bg-blue-500 !h-2 !w-2" />
      </div>
    )
  }

  if (data.kind === 'text') {
    return (
      <div className={`h-full w-full px-1 py-0.5 ${selected ? 'ring-1 ring-blue-400 rounded' : ''}`}>
        {data.editing ? (
          <EditableText id={id} value={data.title} onCommit={(v) => updateNode(id, { title: v, editing: false })} />
        ) : (
          <div onDoubleClick={() => updateNode(id, { editing: true })} className="whitespace-pre-wrap text-sm text-gray-900">{data.title || 'Text'}</div>
        )}
        <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-gray-300" />
        <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-gray-300" />
        <NodeResizer isVisible={selected} minWidth={60} minHeight={24} lineClassName="!border-blue-400" handleClassName="!bg-blue-500 !h-2 !w-2" />
      </div>
    )
  }

  if (data.kind === 'image') {
    return (
      <div className={`flex h-full w-full flex-col overflow-hidden rounded-lg border bg-white ${selected ? 'border-blue-500 ring-1 ring-blue-400' : 'border-gray-200'}`}>
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={data.title} className="min-h-0 flex-1 w-full object-cover" />
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-gray-50 text-gray-300"><ImageIcon size={24} /></div>
        )}
        <div className="border-t border-gray-100 px-2 py-1 text-xs text-gray-600">{data.title || 'Image'}</div>
        <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-gray-300" />
        <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-gray-300" />
        <NodeResizer isVisible={selected} minWidth={120} minHeight={80} lineClassName="!border-blue-400" handleClassName="!bg-blue-500 !h-2 !w-2" />
      </div>
    )
  }

  if (data.kind === 'link') {
    const url = data.url ? sanitizeUrl(data.url) : ''
    return (
      <a
        href={url || undefined}
        target="_blank"
        rel="noreferrer noopener"
        onClick={(e) => {
          e.preventDefault()
          if ((e.metaKey || e.ctrlKey) && url) window.open(url, '_blank', 'noopener')
        }}
        onDoubleClick={() => updateNode(id, { editing: true })}
        className={`relative flex h-full w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 ${selected ? 'border-blue-500 ring-1 ring-blue-400' : 'border-gray-200'} hover:border-blue-300`}
      >
        <LinkIcon size={14} className="text-blue-600" />
        {data.editing ? (
          <EditableText id={id} value={data.title} onCommit={(v) => updateNode(id, { title: v, editing: false })} />
        ) : (
          <span className="truncate text-sm text-blue-700">{data.title || data.url || 'Link'}</span>
        )}
        <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-gray-300" />
        <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-gray-300" />
        <NodeResizer isVisible={selected} minWidth={120} minHeight={30} lineClassName="!border-blue-400" handleClassName="!bg-blue-500 !h-2 !w-2" />
      </a>
    )
  }

  // Default styled card
  return (
    <div
      className={`h-full w-full rounded-xl border bg-white px-3 py-2.5 shadow-sm transition-shadow ${selected ? 'border-blue-500 shadow-md ring-1 ring-blue-400' : 'border-gray-200 hover:border-gray-300'}`}
      style={data.color ? { borderLeftWidth: 4, borderLeftColor: data.color } : undefined}
    >
      <div className="flex items-center gap-1.5">
        {KIND_ICON[data.kind] ?? <Star size={13} className="text-blue-600" />}
        {data.editing ? (
          <EditableText id={id} value={data.title} onCommit={(v) => updateNode(id, { title: v, editing: false })} />
        ) : (
          <div onDoubleClick={() => updateNode(id, { editing: true })} className="flex-1 truncate text-sm font-semibold text-gray-900">
            {data.title || 'Untitled'}
          </div>
        )}
        {data.collapsed !== undefined && (
          <button
            aria-label={data.collapsed ? 'Expand' : 'Collapse'}
            onClick={(e) => { e.stopPropagation(); toggleCollapse(id) }}
            className="rounded px-1 text-xs text-gray-400 hover:bg-gray-100"
          >
            {data.collapsed ? '+' : '–'}
          </button>
        )}
      </div>

      {data.description && <div className="mt-1 line-clamp-2 text-xs text-gray-500">{data.description}</div>}

      {data.kind === 'task' && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <input
            type="checkbox"
            checked={data.status === 'done'}
            onChange={(e) => updateNode(id, { status: e.target.checked ? 'done' : 'todo' })}
            className="h-3.5 w-3.5 accent-blue-600"
            aria-label="Toggle task"
          />
          {data.priority && data.priority !== 'none' && (
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_COLOR[data.priority]}`}>{data.priority}</span>
          )}
          {data.status && data.status !== 'none' && (
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">{STATUS_LABEL[data.status]}</span>
          )}
        </div>
      )}

      {data.kind === 'project' && typeof data.progress === 'number' && (
        <div className="mt-1.5">
          <div className="h-1.5 w-full rounded bg-gray-100">
            <div className="h-full rounded bg-blue-500" style={{ width: `${Math.min(100, data.progress)}%` }} />
          </div>
          <div className="mt-0.5 text-right text-[10px] text-gray-400">{data.progress}%</div>
        </div>
      )}

      {data.kind === 'goal' && typeof data.progress === 'number' && (
        <div className="mt-1.5 h-1.5 w-full rounded bg-gray-100">
          <div className="h-full rounded bg-emerald-500" style={{ width: `${Math.min(100, data.progress)}%` }} />
        </div>
      )}

      {data.kind === 'checklist' && data.checklist && (
        <div className="mt-1 space-y-1">
          {data.checklist.slice(0, 5).map((item) => (
            <label key={item.id} className="flex items-center gap-1.5 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() =>
                  updateNode(id, {
                    checklist: (data.checklist ?? []).map((c) => (c.id === item.id ? { ...c, done: !c.done } : c)),
                  })
                }
                className="h-3 w-3 accent-blue-600"
              />
              <span className={item.done ? 'text-gray-400 line-through' : ''}>{item.text}</span>
            </label>
          ))}
        </div>
      )}

      {data.tags && data.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {data.tags.map((t) => (
            <span key={t} className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">#{t}</span>
          ))}
        </div>
      )}

      <NodeResizer isVisible={selected} minWidth={120} minHeight={50} lineClassName="!border-blue-400" handleClassName="!bg-blue-500 !h-2 !w-2" />
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-gray-300" />
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-gray-300" />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-gray-300" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-gray-300" />
    </div>
  )
}

export default memo(MindNodeComponent)
