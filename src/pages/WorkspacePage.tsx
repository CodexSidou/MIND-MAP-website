import React from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useStore } from '../store/useStore'
import { useKeyboard } from '../hooks/useKeyboard'
import TopBar from '../components/sidebar/TopBar'
import Sidebar from '../components/sidebar/Sidebar'
import Toolbar from '../components/toolbar/Toolbar'
import Canvas from '../components/canvas/Canvas'
import PropertiesPanel from '../components/panels/PropertiesPanel'
import CommandPalette from '../components/panels/CommandPalette'
import SearchDialog from '../components/panels/SearchDialog'
import SettingsDialog from '../components/panels/SettingsDialog'
import AIPanel from '../components/panels/AIPanel'
import TemplatesDialog from '../components/panels/TemplatesDialog'
import ContextMenu from '../components/panels/ContextMenu'
import Toasts from '../components/ui/Toasts'

export default function WorkspacePage() {
  useKeyboard()
  const active = useStore((s) => s.activeMap())
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
        <TopBar />
        <div className="relative flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="relative flex-1">
            {active && active.nodes.length === 0 ? <EmptyState /> : <Canvas />}
            <div className="absolute left-1/2 z-10 -translate-x-1/2 top-3 max-md:top-auto max-md:bottom-4">
              <Toolbar />
            </div>
            <PropertiesPanel />
          </main>
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
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-white text-center">
      <p className="text-xl font-semibold text-gray-800">Your canvas is empty. 🎨</p>
      <p className="text-sm text-gray-400">Start with an idea. 💡</p>
      <button onClick={() => addNode('idea', { x: 200, y: 200 })} className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        + Create your first node
      </button>
      <button onClick={() => setUi({ templatesOpen: true })} className="text-sm text-blue-600 hover:underline">
        Choose a template
      </button>
    </div>
  )
}
