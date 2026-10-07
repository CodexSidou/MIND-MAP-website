import React, { useState } from 'react'
import {
  Brain, Plus, Star, Trash2, RotateCcw, ChevronLeft, ChevronRight, LayoutTemplate, Sparkles,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { t } from '../../i18n'

export default function Sidebar() {
  const open = useStore((s) => s.ui.sidebarOpen)
  const setUi = useStore((s) => s.setUi)
  const maps = useStore((s) => s.maps)
  const activeMapId = useStore((s) => s.activeMapId)
  const openMap = useStore((s) => s.openMap)
  const createMap = useStore((s) => s.createMap)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const trashMap = useStore((s) => s.trashMap)
  const restoreMap = useStore((s) => s.restoreMap)
  const lang = useStore((s) => s.language)
  const [showTrash, setShowTrash] = useState(false)

  const active = maps.filter((m) => !m.inTrash)
  const trashed = maps.filter((m) => m.inTrash)

  if (!open) {
    return (
      <button
        aria-label="Open sidebar"
        onClick={() => setUi({ sidebarOpen: true })}
        className="absolute left-2 top-2 z-20 rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 shadow-sm hover:bg-gray-50"
      >
        <ChevronRight size={16} />
      </button>
    )
  }

  return (
    <aside className="absolute inset-y-0 left-0 z-30 flex h-full w-60 shrink-0 flex-col border-r border-gray-100 bg-white shadow-lg md:relative md:shadow-none">
      <div className="flex items-center justify-between p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t(lang, 'workspace')}</span>
        <button aria-label="Collapse sidebar" onClick={() => setUi({ sidebarOpen: false })} className="rounded p-1 text-gray-400 hover:bg-gray-100">
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <Section title={`🗺️ ${t(lang, 'myMindMaps')}`}>
          {active.map((m) => (
            <MapRow key={m.id} name={m.name} icon={m.icon} active={m.id === activeMapId} favorite={m.favorite}
              onOpen={() => openMap(m.id)} onFav={() => toggleFavorite(m.id)} onTrash={() => trashMap(m.id)} />
          ))}
        </Section>

        <Section title={`⭐ ${t(lang, 'favorites')}`}>
          {active.filter((m) => m.favorite).map((m) => (
            <button key={m.id} onClick={() => openMap(m.id)} className="block w-full truncate rounded-md px-2 py-1 text-left text-sm text-gray-600 hover:bg-gray-50">
              {m.icon} {m.name}
            </button>
          ))}
        </Section>

        <Section title={`🗑️ ${t(lang, 'trash')}`}>
          <button onClick={() => setShowTrash((v) => !v)} className="text-xs text-gray-400 hover:text-gray-600">
            {showTrash ? 'Hide' : `Show (${trashed.length})`}
          </button>
          {showTrash && trashed.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-md px-2 py-1 text-sm text-gray-400">
              <span className="truncate">{m.icon} {m.name}</span>
              <button aria-label="Restore" onClick={() => restoreMap(m.id)} className="p-1 hover:text-blue-600"><RotateCcw size={12} /></button>
            </div>
          ))}
        </Section>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t(lang, 'create')}</p>
          <button onClick={() => createMap('Untitled', '🧠')} className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
            <Plus size={14} /> {t(lang, 'newMindMap')}
          </button>
          <button onClick={() => createMap('New Project', '🚀', 'project-planning')} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
            <Sparkles size={14} /> {t(lang, 'newProject')}
          </button>
          <button onClick={() => createMap('Brainstorm', '💡')} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
            <Brain size={14} /> {t(lang, 'newBrainstorm')}
          </button>
          <button onClick={() => setUi({ templatesOpen: true })} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
            <LayoutTemplate size={14} /> {t(lang, 'templates')}
          </button>
        </div>
      </div>
    </aside>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="px-2 pb-1 text-[11px] font-medium text-gray-300">{title}</p>
      {children}
    </div>
  )
}

function MapRow({ name, icon, active, favorite, onOpen, onFav, onTrash }: {
  name: string; icon: string; active: boolean; favorite: boolean; onOpen: () => void; onFav: () => void; onTrash: () => void
}) {
  return (
    <div className={`group flex items-center justify-between rounded-md px-2 py-1.5 ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
      <button onClick={onOpen} className="min-w-0 flex-1 truncate text-left text-sm">{icon} {name}</button>
      <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
        <button aria-label="Favorite" onClick={onFav} className={`p-1 ${favorite ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'}`}><Star size={12} /></button>
        <button aria-label="Trash" onClick={onTrash} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={12} /></button>
      </div>
    </div>
  )
}
