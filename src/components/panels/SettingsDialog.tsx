import React, { useState } from 'react'
import { useStore } from '../../store/useStore'
import { t } from '../../i18n'
import type { Language } from '../../types'

export default function SettingsDialog() {
  const open = useStore((s) => s.ui.settingsOpen)
  const setUi = useStore((s) => s.setUi)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const language = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const maps = useStore((s) => s.maps)
  const clearAllData = useStore((s) => s.clearAllData)
  const exportAllToJson = async () => {
    const { exportAllToJson } = await import('../../lib/export/exporter')
    exportAllToJson(maps, true)
  }
  const [tab, setTab] = useState<'general' | 'canvas' | 'keyboard' | 'data' | 'about'>('general')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setUi({ settingsOpen: false })}>
      <div className="flex h-[70vh] w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <nav className="flex w-40 flex-col gap-0.5 border-r border-gray-100 p-3 text-sm">
          {(['general', 'canvas', 'keyboard', 'data', 'about'] as const).map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} className={`rounded-md px-2 py-1.5 text-left capitalize ${tab === tb ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>{tb}</button>
          ))}
        </nav>
        <div className="flex-1 overflow-y-auto p-5 text-sm">
          {tab === 'general' && (
            <div className="space-y-4">
              <Row label="Language">
                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="rounded-md border border-gray-200 px-2 py-1.5">
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                  <option value="pt">Português</option>
                  <option value="zh">中文</option>
                </select>
              </Row>
              <Row label="Autosave">
                <input type="checkbox" checked={settings.autosave} onChange={(e) => updateSettings({ autosave: e.target.checked })} className="accent-blue-600" />
              </Row>
              <Row label="Optional AI API key">
                <input
                  type="password"
                  value={settings.aiApiKey}
                  onChange={(e) => updateSettings({ aiApiKey: e.target.value })}
                  placeholder="sk-…"
                  className="w-64 rounded-md border border-gray-200 px-2 py-1.5 outline-none focus:border-blue-300"
                />
              </Row>
            </div>
          )}
          {tab === 'canvas' && (
            <div className="space-y-4">
              <Row label={t(language, 'grid')}>
                <select value={settings.gridType} onChange={(e) => updateSettings({ gridType: e.target.value as typeof settings.gridType })} className="rounded-md border border-gray-200 px-2 py-1.5">
                  <option value="dots">Dots</option>
                  <option value="lines">Lines</option>
                  <option value="none">Off</option>
                </select>
              </Row>
              <Row label="Grid size">
                <input type="number" min={8} max={64} value={settings.gridSize} onChange={(e) => updateSettings({ gridSize: Number(e.target.value) || 24 })} className="w-24 rounded-md border border-gray-200 px-2 py-1.5" />
              </Row>
              <Row label={t(language, 'snap')}>
                <input type="checkbox" checked={settings.snap} onChange={(e) => updateSettings({ snap: e.target.checked })} className="accent-blue-600" />
              </Row>
            </div>
          )}
          {tab === 'keyboard' && (
            <table className="w-full text-left text-xs">
              <tbody>
                {[
                  ['V / H / N / T / C / G', 'Tools'],
                  ['Delete', 'Delete selection'],
                  ['Ctrl+Z / Ctrl+Shift+Z', 'Undo / Redo'],
                  ['Ctrl+C / V / D', 'Copy / Paste / Duplicate'],
                  ['Ctrl+K', 'Command palette'],
                  ['Ctrl+F', 'Search'],
                  ['Space + drag', 'Pan'],
                  ['+ / −', 'Zoom'],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-50">
                    <td className="py-1.5 font-mono text-gray-700">{k}</td>
                    <td className="py-1.5 text-gray-500">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'data' && (
            <div className="space-y-3">
              <button onClick={exportAllToJson} className="rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50">Export all data (JSON)</button>
              <button
                onClick={() => { if (window.confirm('Delete ALL local data? This cannot be undone.')) clearAllData().then(() => window.location.reload()) }}
                className="block rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
              >
                Clear local data
              </button>
            </div>
          )}
          {tab === 'about' && (
            <div className="space-y-2 text-gray-600">
              <p><strong>MindMap Pro</strong> v1.0.0</p>
              <p>Think visually. Build anything.</p>
              <p>Local-first, free forever, no account required.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-gray-600">{label}</span>
      {children}
    </label>
  )
}
