import React from 'react'
import { Brain } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function MobileLandingPage({ onStart }: { onStart: () => void }) {
  const lang = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  return (
    <div className="min-h-screen bg-[#0F1013] text-white flex flex-col px-6 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={22} className="text-blue-500" />
          <span className="font-semibold tracking-tight">MindMap Pro</span>
        </div>
        <div className="flex gap-1 text-[11px] text-gray-400">
          {(['en', 'fr', 'ar', 'es', 'de', 'pt', 'zh'] as const).map((l) => (
            <button key={l} onClick={() => setLanguage(l)} className={`rounded px-1.5 py-0.5 ${lang === l ? 'bg-gray-800 text-white' : ''}`}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div className="mt-16 flex-1">
        <div className="text-5xl">🧠</div>
        <h1 className="mt-5 text-4xl font-bold leading-tight">Think visually.<br />Build anything.</h1>
        <p className="mt-4 text-gray-400">Create connected mind maps on an infinite canvas — free, offline, and private.</p>

        <ul className="mt-8 space-y-3 text-sm text-gray-300">
          <li>🗺️ Infinite canvas &amp; infinite ideas</li>
          <li>🔗 Connect everything, anywhere</li>
          <li>💾 Saved automatically on your phone</li>
          <li>↩️ Undo, copies, colors, templates</li>
        </ul>
      </div>

      <button
        onClick={onStart}
        className="mt-10 w-full rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white active:bg-blue-700"
      >
        Start Mapping
      </button>
      <p className="mt-3 text-center text-xs text-gray-500">Free forever · No account · Works offline</p>
    </div>
  )
}
