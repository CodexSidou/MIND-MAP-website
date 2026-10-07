import { toPng, toSvg } from 'html-to-image'
import type { MindMap, MindNode } from '../../types'

function download(filename: string, content: string | Blob, type = 'application/json') {
  const blob = content instanceof Blob ? content : new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function mapToJson(map: MindMap | null): string {
  return JSON.stringify({ app: 'MindMapPro', version: 1, map }, null, 2)
}

export function exportMapToJson(map: MindMap | null, downloadIt = false): string {
  const json = mapToJson(map)
  if (downloadIt) download(`${map?.name ?? 'mindmap'}.json`, json)
  return json
}

export function exportAllToJson(maps: MindMap[], downloadIt = false): string {
  const json = JSON.stringify({ app: 'MindMapPro', version: 1, maps }, null, 2)
  if (downloadIt) download('mindmap-workspace.json', json)
  return json
}

export function mapToMarkdown(map: MindMap | null): string {
  if (!map) return ''
  const lines: string[] = [`# ${map.name}`, '']
  const bySource = new Map<string, string[]>()
  for (const e of map.edges) {
    const arr = bySource.get(e.source) ?? []
    arr.push(e.target)
    bySource.set(e.source, arr)
  }
  const childrenOf = (id: string): MindNode[] =>
    (bySource.get(id) ?? [])
      .map((tid) => map.nodes.find((n) => n.id === tid))
      .filter((n): n is MindNode => !!n)
  const roots = map.nodes.filter((n) => !map.edges.some((e) => e.target === n.id))
  const walk = (node: MindNode, depth: number) => {
    lines.push(`${'  '.repeat(depth)}- **${node.data.title || 'Untitled'}**${node.data.description ? ` — ${node.data.description}` : ''}`)
    for (const ch of childrenOf(node.id)) walk(ch, depth + 1)
  }
  for (const r of roots) walk(r, 0)
  if (roots.length === 0) {
    for (const n of map.nodes) lines.push(`- **${n.data.title || 'Untitled'}**`)
  }
  return lines.join('\n')
}

export function exportMarkdown(map: MindMap | null, downloadIt = false): string {
  const md = mapToMarkdown(map)
  if (downloadIt) download(`${map?.name ?? 'mindmap'}.md`, md, 'text/markdown')
  return md
}

function canvasEl(): HTMLElement | null {
  return document.querySelector('.react-flow') as HTMLElement | null
}

export async function exportPng(): Promise<void> {
  const el = canvasEl()
  if (!el) throw new Error('no canvas')
  const dataUrl = await toPng(el, { backgroundColor: '#ffffff' })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = 'mindmap.png'
  a.click()
}

export async function exportSvg(): Promise<void> {
  const el = canvasEl()
  if (!el) throw new Error('no canvas')
  const dataUrl = await toSvg(el, { backgroundColor: '#ffffff' })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = 'mindmap.svg'
  a.click()
}
