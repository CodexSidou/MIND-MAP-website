import React from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useStore } from '../store/useStore'
import { useKeyboard } from '../hooks/useKeyboard'
import MobileHeader from '../components/sidebar/MobileHeader'
import Sidebar from '../components/sidebar/Sidebar'
import MobileTabBar from '../components/toolbar/MobileTabBar'
import Canvas from '../components/canvas/Canvas'
import PropertiesPanel from '../components/panels/PropertiesPanel'
import CommandPalette from '../components/panels/CommandPalette'
import SearchDialog from '../components/panels/SearchDialog'
import SettingsDialog from '../components/panels/SettingsDialog'
import AIPanel from '../components/panels/AIPanel'
import TemplatesDialog from '../components/panels/TemplatesDialog'
import ContextMenu from '../components/panels/ContextMenu'
import Toasts from '../components/ui/Toasts'

export default function MobileAppPage() {
  useKeyboard()
  const active = useStore((s) => s.activeMap())
  const sidebarOpen = useStore((s) => s.ui.sidebarOpen)
  const setUi = useStore((s) => s.setUi)
  return (
    <ReactFlowProvider>
      <div className="flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#0F1013]">
        <MobileHeader />
        <div className="relative flex-1">
          {sidebarOpen && <div className="absolute inset-0 z-20 bg-black/60" onClick={() => setUi({ sidebarOpen: false })} />}
          <Sidebar />
          {active && active.nodes.length === 0 ? <EmptyState /> : <Canvas />}
          <MobileTabBar />
          <PropertiesPanel />
        </div>
        <CommandPalette />
        <SearchDialog />
        <SettingsDialog />
        <AIPanel />
        <TemplatesDialog />
        <ContextMenu />
        <Toasts />
      </div>
    </ReactFlowProvider>
  )
}

function EmptyState() {
  const addNode = useStore((s) => s.addNode)
  const setUi = useStore((s) => s.setUi)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#0F1013] text-center px-6">
      <p className="text-xl font-semibold text-gray-100">Your canvas is empty. 🎨</p>
      <p className="text-sm text-gray-400">Tap a tool below, or start with an idea. 💡</p>
      <button onClick={() => addNode('idea', { x: 60, y: 60 })} className="mt-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white active:bg-blue-700">
        + Create your first node
      </button>
      <button onClick={() => setUi({ templatesOpen: true })} className="text-sm text-blue-400">
        Choose a template
      </button>
    </div>
  )
}
