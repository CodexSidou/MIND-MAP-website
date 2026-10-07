import React, { useState } from 'react'
import {
  MousePointer2, Hand, Square, Pencil, Spline, Frame, MoreHorizontal, StickyNote, Circle, Image, Link, ListChecks, Type,
} from 'lucide-react'
import type { Tool } from '../../types'
import { useStore } from '../../store/useStore'

const MAIN: { tool: Tool; icon: React.ReactNode; label: string }[] = [
  { tool: 'select', icon: <MousePointer2 size={20} />, label: 'Select' },
  { tool: 'hand', icon: <Hand size={20} />, label: 'Pan' },
  { tool: 'node', icon: <Square size={20} />, label: 'Node' },
  { tool: 'text', icon: <Type size={20} />, label: 'Text' },
  { tool: 'connect', icon: <Spline size={20} />, label: 'Link' },
  { tool: 'frame', icon: <Frame size={20} />, label: 'Frame' },
]

const MORE: { tool: Tool; icon: React.ReactNode; label: string }[] = [
  { tool: 'sticky', icon: <StickyNote size={18} />, label: 'Sticky note' },
  { tool: 'rect', icon: <Square size={18} />, label: 'Rectangle' },
  { tool: 'circle', icon: <Circle size={18} />, label: 'Circle' },
  { tool: 'image', icon: <Image size={18} />, label: 'Image' },
  { tool: 'link', icon: <Link size={18} />, label: 'Link card' },
  { tool: 'checklist', icon: <ListChecks size={18} />, label: 'Checklist' },
]

export default function MobileTabBar() {
  const tool = useStore((s) => s.tool)
  const setTool = useStore((s) => s.setTool)
  const [more, setMore] = useState(false)
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-3">
      {more && (
        <div className="pointer-events-auto mx-auto mb-2 w-72 rounded-2xl border border-gray-800 bg-[#15161A] p-2 shadow-2xl">
          <div className="grid grid-cols-3 gap-1">
            {MORE.map((m) => (
              <button
                key={m.tool}
                onClick={() => { setTool(m.tool); setMore(false) }}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] ${tool === m.tool ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 active:bg-gray-800'}`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="pointer-events-auto mx-auto flex w-[min(94vw,420px)] items-center justify-between rounded-2xl border border-gray-800 bg-[#15161A]/95 px-2 py-2 shadow-2xl backdrop-blur">
        {MAIN.map((m) => (
          <button
            key={m.tool}
            aria-label={m.label}
            onClick={() => setTool(m.tool)}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 ${tool === m.tool ? 'text-blue-400' : 'text-gray-400 active:bg-gray-800'}`}
          >
            {m.icon}
            <span className="text-[10px] leading-none">{m.label}</span>
          </button>
        ))}
        <button
          aria-label="More tools"
          onClick={() => setMore((v) => !v)}
          className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 ${more ? 'text-blue-400' : 'text-gray-400 active:bg-gray-800'}`}
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] leading-none">More</span>
        </button>
      </div>
    </div>
  )
}
