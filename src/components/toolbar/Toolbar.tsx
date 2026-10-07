import React from 'react'
import {
  MousePointer2, Hand, Square, StickyNote, Spline, Square as SquareIcon2, Circle, Frame, Image, Link, ListChecks, Type,
} from 'lucide-react'
import type { Tool } from '../../types'
import { useStore } from '../../store/useStore'
import { t } from '../../i18n'
import type { Dict } from '../../i18n/en'

interface ToolDef { tool: Tool; icon: React.ReactNode; labelKey: keyof Dict; shortcut: string }

const TOOLS: ToolDef[] = [
  { tool: 'select', icon: <MousePointer2 size={16} />, labelKey: 'toolSelect', shortcut: 'V' },
  { tool: 'hand', icon: <Hand size={16} />, labelKey: 'toolHand', shortcut: 'H' },
  { tool: 'node', icon: <Square size={16} />, labelKey: 'toolNode', shortcut: 'N' },
  { tool: 'text', icon: <Type size={16} />, labelKey: 'toolText', shortcut: 'T' },
  { tool: 'sticky', icon: <StickyNote size={16} />, labelKey: 'toolSticky', shortcut: '' },
  { tool: 'connect', icon: <Spline size={16} />, labelKey: 'toolConnect', shortcut: 'C' },
  { tool: 'rect', icon: <SquareIcon2 size={16} />, labelKey: 'toolRect', shortcut: '' },
  { tool: 'circle', icon: <Circle size={16} />, labelKey: 'toolCircle', shortcut: '' },
  { tool: 'frame', icon: <Frame size={16} />, labelKey: 'toolFrame', shortcut: 'G' },
  { tool: 'image', icon: <Image size={16} />, labelKey: 'toolImage', shortcut: '' },
  { tool: 'link', icon: <Link size={16} />, labelKey: 'toolLink', shortcut: '' },
  { tool: 'checklist', icon: <ListChecks size={16} />, labelKey: 'toolChecklist', shortcut: '' },
]

export default function Toolbar() {
  const tool = useStore((s) => s.tool)
  const setTool = useStore((s) => s.setTool)
  const lang = useStore((s) => s.language)
  return (
    <div className="flex max-w-[92vw] items-center gap-0.5 overflow-x-auto rounded-xl border border-gray-200 bg-white/95 p-1 shadow-sm">
      {TOOLS.map((td) => (
        <button
          key={td.tool}
          aria-label={t(lang, td.labelKey)}
          title={`${t(lang, td.labelKey)}${td.shortcut ? ` (${td.shortcut})` : ''}`}
          onClick={() => setTool(td.tool)}
          className={`rounded-lg p-2 transition-colors ${tool === td.tool ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
        >
          {td.icon}
        </button>
      ))}
    </div>
  )
}
