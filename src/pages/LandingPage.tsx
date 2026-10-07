import React, { useMemo } from 'react'
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Brain } from 'lucide-react'
import { useStore } from '../store/useStore'
import MindNodeComponent from '../components/nodes/MindNode'
import { templates, buildDemo } from '../templates'

const nodeTypes = { mind: MindNodeComponent }

export default function LandingPage({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  const lang = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const demo = useMemo(() => buildDemo(), [])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-blue-600" />
          <span className="font-semibold tracking-tight">MindMap Pro</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {(['en', 'fr', 'ar', 'es', 'de', 'pt', 'zh'] as const).map((l) => (
            <button key={l} onClick={() => setLanguage(l)} className={`rounded px-1.5 py-0.5 ${lang === l ? 'bg-gray-100 text-gray-700' : 'hover:text-gray-600'}`}>
              {l.toUpperCase()}
            </button>
          ))}
          <button onClick={onStart} className="ml-2 rounded-lg bg-gray-900 px-3 py-1.5 font-medium text-white hover:bg-gray-800">Open App</button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 text-center">
        <div className="mx-auto mb-4 text-5xl">🧠</div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Think visually.<br />Build anything.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-500">
          Turn ideas, projects and plans into connected visual workspaces.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={onStart} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
            Start Mapping
          </button>
          <button onClick={onDemo} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Explore Demo
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="h-[420px] overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <ReactFlow
            nodes={demo.nodes}
            edges={demo.edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2E3138" />
          </ReactFlow>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '💾', t: 'Local-first', d: 'Everything is stored in your browser with IndexedDB. Your data never leaves your device.' },
          { icon: '🌍', t: 'Free forever', d: 'No accounts, no subscriptions, no paid APIs. Open and start mapping.' },
          { icon: '🔒', t: 'Private by design', d: 'No tracking, no backend, no telemetry. You own your workspace.' },
        ].map((f) => (
          <div key={f.t} className="rounded-2xl border border-gray-100 p-5">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 font-semibold">{f.t}</h3>
            <p className="mt-1 text-sm text-gray-500">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {templates.map((tp) => (
            <div key={tp.id} className="rounded-xl border border-gray-100 p-4 text-center text-sm text-gray-600">
              <div className="text-2xl">{tp.icon}</div>
              <div className="mt-1 font-medium">{tp.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
          {[
            { n: '1', t: 'Create a node', d: 'Click the node tool and drop ideas anywhere on the infinite canvas.' },
            { n: '2', t: 'Connect ideas', d: 'Drag from one handle to another to build your map.' },
            { n: '3', t: 'Save & export', d: 'Everything autosaves locally. Export to JSON, Markdown, PNG or SVG.' },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-gray-100 p-5">
              <div className="font-bold text-blue-600">{s.n === '1' ? '1️⃣' : s.n === '2' ? '2️⃣' : '3️⃣'}</div>
              <h3 className="mt-1 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-gray-500">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Start mapping — it is free.</h2>
        <button onClick={onStart} className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Start Mapping
        </button>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        MindMap Pro — Think visually. Build anything. · Free forever. No account required.
      </footer>
    </div>
  )
}

