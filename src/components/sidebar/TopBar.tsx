import React, { useRef, useState } from 'react'
import { Brain, Search, Share2, Download, Settings as SettingsIcon, Upload, Sparkles } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { t } from '../../i18n'
import { exportMapToJson, exportAllToJson, exportMarkdown, exportPng, exportSvg } from '../../lib/export/exporter'
import { importFromJson } from '../../lib/import/importer'

export default function TopBar() {
  const maps = useStore((s) => s.maps)
  const activeMap = useStore((s) => s.activeMap())
  const language = useStore((s) => s.language)
  const renameActive = useStore((s) => s.renameActive)
  const setUi = useStore((s) => s.setUi)
  const saveState = useStore((s) => s.ui.saveState)
  const toast = useStore((s) => s.toast)
  const [exportOpen, setExportOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const doImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const maps = await importFromJson(await f.text())
      useStore.setState((s) => ({ maps: [...maps, ...s.maps] }))
      toast('Import complete')
    } catch {
      toast(t(language, 'importFailed'), 'error')
    }
    e.target.value = ''
  }

  return (
    <header className="flex h-12 items-center gap-2 border-b border-gray-100 bg-white px-3">
      <div className="flex items-center gap-2">
        <Brain size={18} className="text-blue-600" />
        <span className="text-sm font-semibold tracking-tight">MindMap Pro</span>
      </div>

      <input
        aria-label="Workspace name"
        value={activeMap?.name ?? ''}
        onChange={(e) => renameActive(e.target.value)}
        className="ml-2 w-44 truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-sm text-gray-700 outline-none hover:border-gray-200 focus:border-blue-300"
        placeholder="Workspace"
      />

      <span className={`ml-1 text-xs ${saveState === 'saving' ? 'text-amber-500' : 'text-emerald-500'}`}>
        {saveState === 'saving' ? `⟳ ${t(language, 'saving')}` : `● ${t(language, 'saved')}`}
      </span>

      <div className="flex-1" />

      <button aria-label="AI" title="AI tools" onClick={() => setUi({ aiOpen: true })} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
        <Sparkles size={16} />
      </button>
      <button aria-label={t(language, 'search')} title="Search (Ctrl+F)" onClick={() => setUi({ searchOpen: true })} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
        <Search size={16} />
      </button>
      <button aria-label="Import" title="Import" onClick={() => fileRef.current?.click()} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
        <Upload size={16} />
      </button>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
      <button
        aria-label={t(language, 'share')}
        title="Share"
        onClick={() => { navigator.clipboard.writeText(exportMapToJson(activeMap)).catch(() => {}); toast('Copied to clipboard') }}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
      >
        <Share2 size={16} />
      </button>

      <div className="relative">
        <button aria-label={t(language, 'export')} onClick={() => setExportOpen((v) => !v)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Download size={16} />
        </button>
        {exportOpen && (
          <div className="absolute right-0 z-30 mt-1 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg" onMouseLeave={() => setExportOpen(false)}>
            <MenuItem label="JSON (this map)" onClick={() => { exportMapToJson(activeMap, true); setExportOpen(false); toast(t(language, 'exportComplete')) }} />
            <MenuItem label="JSON (all maps)" onClick={() => { exportAllToJson(maps, true); setExportOpen(false); toast(t(language, 'exportComplete')) }} />
            <MenuItem label="Markdown" onClick={() => { exportMarkdown(activeMap, true); setExportOpen(false); toast(t(language, 'exportComplete')) }} />
            <MenuItem label="PNG" onClick={async () => { try { await exportPng(); toast(t(language, 'exportComplete')) } catch { toast(t(language, 'exportFailed'), 'error') } setExportOpen(false) }} />
            <MenuItem label="SVG" onClick={async () => { try { await exportSvg(); toast(t(language, 'exportComplete')) } catch { toast(t(language, 'exportFailed'), 'error') } setExportOpen(false) }} />
          </div>
        )}
      </div>

      <button aria-label={t(language, 'settings')} onClick={() => setUi({ settingsOpen: true })} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
        <SettingsIcon size={16} />
      </button>
    </header>
  )
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50">{label}</button>
}
