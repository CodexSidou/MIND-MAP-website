import React, { useMemo } from 'react'
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Brain, Check, Globe, ShieldCheck, Sparkles, Layers, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'
import MindNodeComponent from '../components/nodes/MindNode'
import { templates, buildDemo } from '../templates'

const nodeTypes = { mind: MindNodeComponent }

export default function LandingPage({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  const lang = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const demo = useMemo(() => buildDemo(), [])

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white"><Brain size={16} /></div>
            <span className="font-semibold tracking-tight">MindMap Pro</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-500 sm:flex">
            <a href="#features">Features</a>
            <a href="#templates">Templates</a>
            <a href="#how">How it works</a>
          </nav>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            {(['en', 'fr', 'ar', 'es', 'de', 'pt', 'zh'] as const).map((l) => (
              <button key={l} onClick={() => setLanguage(l)} className={`rounded px-1.5 py-0.5 ${lang === l ? 'bg-slate-100 text-slate-700' : 'hover:text-slate-600'}`}>
                {l.toUpperCase()}
              </button>
            ))}
            <button onClick={onStart} className="ml-2 rounded-full bg-slate-900 px-4 py-1.5 font-medium text-white transition hover:bg-slate-800">Open App</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <Sparkles size={12} /> 100% free · local-first · no account
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Think visually.<br />
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">Build anything.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-slate-500">
            Turn ideas, projects and plans into connected visual workspaces on an infinite canvas.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={onStart} className="rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
              Start Mapping →
            </button>
            <button onClick={onDemo} className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Explore Demo
            </button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Check size={12} className="text-emerald-500" /> Works offline · No login · Exports JSON, PNG, SVG, Markdown
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60">
          <div className="h-[380px] overflow-hidden rounded-2xl">
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
              <Background variant={BackgroundVariant.Dots} gap={26} size={1} color="#E2E8F0" />
            </ReactFlow>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-3xl font-bold tracking-tight">Everything you need to think bigger</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: <Layers size={20} />, t: 'All node types', d: 'Ideas, tasks, notes, projects, goals, checklists, links, images and more.' },
            { icon: <Zap size={20} />, t: 'Fast canvas', d: 'Smooth pan and zoom with dot-grid snapping and a live minimap.' },
            { icon: <Globe size={20} />, t: 'Offline first', d: 'Every workspace is stored locally in your browser via IndexedDB.' },
            { icon: <ShieldCheck size={20} />, t: 'Private by default', d: 'No server, no tracking, no sign-up. Your data stays yours.' },
            { icon: <Sparkles size={20} />, t: 'Command palette', d: 'Press Ctrl+K to create, search and navigate without the mouse.' },
            { icon: <Check size={20} />, t: 'Export anywhere', d: 'Download JSON, Markdown, PNG or SVG of any map.' },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-slate-200/70 bg-white p-5 transition hover:shadow-md">
              <div className="text-indigo-600">{f.icon}</div>
              <h3 className="mt-3 font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-3xl font-bold tracking-tight">Start from a template</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {templates.map((tp) => (
            <div key={tp.id} className="rounded-2xl border border-slate-200/70 bg-white p-5 text-center text-sm text-slate-600 transition hover:border-indigo-300 hover:shadow-md">
              <div className="text-2xl">{tp.icon}</div>
              <div className="mt-2 font-medium">{tp.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-3xl bg-slate-900 p-10 text-white">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { n: '01', t: 'Create a node', d: 'Drop an idea anywhere on the infinite canvas.' },
              { n: '02', t: 'Connect ideas', d: 'Drag from a handle to another node to link them.' },
              { n: '03', t: 'Save & share', d: 'Autosaved locally. Export to JSON, PNG, SVG or Markdown.' },
            ].map((s) => (
              <div key={s.n}>
                <div className="text-sm font-semibold text-indigo-400">{s.n}</div>
                <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/60 py-8 text-center text-xs text-slate-400">
        MindMap Pro — free, local-first, open-source spirit. Built for everyone.
      </footer>
    </div>
  )
}
