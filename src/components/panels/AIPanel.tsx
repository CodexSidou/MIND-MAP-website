import React, { useState } from 'react'
import { useStore } from '../../store/useStore'
import { t } from '../../i18n'

export default function AIPanel() {
  const open = useStore((s) => s.ui.aiOpen)
  const setUi = useStore((s) => s.setUi)
  const settings = useStore((s) => s.settings)
  const addNode = useStore((s) => s.addNode)
  const onConnect = useStore((s) => s.onConnect)
  const lang = useStore((s) => s.language)
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useStore((s) => s.toast)

  if (!open) return null

  const generate = async () => {
    if (!settings.aiApiKey) {
      toast(t(lang, 'noApiKey'), 'info')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.aiApiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You output ONLY valid JSON: {"title": string, "children": [{"title": string, "children": [...]}]} describing a mind map with at most 3 levels and 6 children per node.' },
            { role: 'user', content: prompt },
          ],
        }),
      })
      if (!res.ok) throw new Error('api error')
      const data = await res.json()
      const text: string = data.choices?.[0]?.message?.content ?? ''
      const json = JSON.parse(text.replace(/```json|```/g, '').trim())
      placeTree(json, 0, 0, null)
      setUi({ aiOpen: false })
      toast('Mind map generated')
    } catch {
      toast('AI request failed. Check your API key.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const placeTree = (node: { title?: string; children?: any[] }, x: number, y: number, parentId: string | null): string => {
    const id = addNode('idea', { x, y }, { title: String(node.title ?? 'Idea') })
    if (parentId) onConnect({ source: parentId, target: id, sourceHandle: null, targetHandle: null })
    const children = Array.isArray(node.children) ? node.children : []
    const gapY = 130
    const startY = y - ((children.length - 1) * gapY) / 2
    children.forEach((ch, i) => placeTree(ch, x + 280, startY + i * gapY, id))
    return id
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setUi({ aiOpen: false })}>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-gray-800">{t(lang, 'generateMap')}</h3>
        <p className="mt-0.5 text-xs text-gray-400">Optional. Requires an API key configured in Settings.</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t(lang, 'aiPromptPlaceholder')}
          rows={4}
          className="mt-3 w-full resize-none rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-blue-300"
        />
        <button
          disabled={busy || !prompt}
          onClick={generate}
          className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition disabled:opacity-40 hover:bg-blue-700"
        >
          {busy ? 'Generating…' : t(lang, 'generate')}
        </button>
      </div>
    </div>
  )
}
