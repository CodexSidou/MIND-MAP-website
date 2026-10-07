import React from 'react'
import { Menu, Search, Settings, Brain } from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function MobileHeader() {
  const activeMap = useStore((s) => s.activeMap())
  const setUi = useStore((s) => s.setUi)
  const saveState = useStore((s) => s.ui.saveState)
  return (
    <header className="flex h-14 items-center gap-2 border-b border-gray-800 bg-[#111216] px-3">
      <button
        aria-label="Open menu"
        onClick={() => setUi({ sidebarOpen: true })}
        className="rounded-xl p-2 text-gray-400 active:bg-gray-800"
      >
        <Menu size={20} />
      </button>
      <Brain size={18} className="text-blue-500" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-100">
        {activeMap?.name ?? 'MindMap Pro'}
      </span>
      <span className={`text-xs ${saveState === 'saving' ? 'text-amber-500' : 'text-emerald-500'}`}>
        {saveState === 'saving' ? '⟳' : '●'}
      </span>
      <button
        aria-label="Search"
        onClick={() => setUi({ searchOpen: true })}
        className="rounded-xl p-2 text-gray-400 active:bg-gray-800"
      >
        <Search size={20} />
      </button>
      <button
        aria-label="Settings"
        onClick={() => setUi({ settingsOpen: true })}
        className="rounded-xl p-2 text-gray-400 active:bg-gray-800"
      >
        <Settings size={20} />
      </button>
    </header>
  )
}
