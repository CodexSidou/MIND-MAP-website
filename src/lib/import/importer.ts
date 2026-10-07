import type { MindMap } from '../../types'
import { uid } from '../utils/id'

export async function importFromJson(text: string): Promise<MindMap[]> {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('invalid json')
  }
  const obj = parsed as Record<string, unknown>
  const rawMaps = Array.isArray(obj?.maps) ? obj.maps : obj?.map ? [obj.map] : Array.isArray(parsed) ? parsed : null
  if (!rawMaps) throw new Error('invalid shape')
  const maps: MindMap[] = []
  for (const raw of rawMaps) {
    const m = raw as Record<string, unknown>
    if (!Array.isArray(m?.nodes) || !Array.isArray(m?.edges)) throw new Error('invalid map')
    maps.push({
      id: typeof m.id === 'string' ? m.id : uid('map'),
      name: typeof m.name === 'string' ? m.name : 'Imported Map',
      icon: typeof m.icon === 'string' ? m.icon : '🗺️',
      nodes: sanitizeNodes(m.nodes),
      edges: sanitizeEdges(m.edges),
      createdAt: typeof m.createdAt === 'number' ? m.createdAt : Date.now(),
      updatedAt: Date.now(),
      favorite: false,
    })
  }
  return maps
}

function sanitizeNodes(nodes: unknown[]): MindMap['nodes'] {
  return nodes.map((n) => {
    const node = n as Record<string, any>
    if (typeof node.id !== 'string' || !node.position) throw new Error('bad node')
    const data = (node.data ?? {}) as Record<string, unknown>
    return {
      id: node.id,
      type: 'mind',
      position: { x: Number(node.position.x) || 0, y: Number(node.position.y) || 0 },
      style: node.style,
      selected: false,
      data: {
        kind: typeof data.kind === 'string' ? data.kind : 'idea',
        title: String(data.title ?? ''),
        description: data.description ? String(data.description) : undefined,
        color: typeof data.color === 'string' && /^#?[0-9a-fA-F]{3,8}$/.test(data.color) ? data.color : undefined,
        status: typeof data.status === 'string' ? data.status : undefined,
        priority: typeof data.priority === 'string' ? data.priority : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
        checklist: Array.isArray(data.checklist) ? data.checklist.map((c: any) => ({ id: String(c?.id ?? uid('c')), text: String(c?.text ?? ''), done: !!c?.done })) : undefined,
        links: Array.isArray(data.links) ? data.links.map((l: any) => ({ id: String(l?.id ?? uid('l')), label: String(l?.label ?? ''), url: String(l?.url ?? '') })) : undefined,
        url: typeof data.url === 'string' ? data.url : undefined,
        imageUrl: typeof data.imageUrl === 'string' && (/^data:image\//.test(data.imageUrl) || /^https?:\/\//.test(data.imageUrl)) ? data.imageUrl : undefined,
        progress: typeof data.progress === 'number' ? data.progress : undefined,
        collapsed: typeof data.collapsed === 'boolean' ? data.collapsed : undefined,
      },
    }
  }) as MindMap['nodes']
}

function sanitizeEdges(edges: unknown[]): MindMap['edges'] {
  return edges
    .map((e) => {
      const edge = e as Record<string, any>
      if (typeof edge.id !== 'string' || typeof edge.source !== 'string' || typeof edge.target !== 'string') return null
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: typeof edge.label === 'string' ? edge.label : undefined,
        type: 'smoothstep',
        style: { stroke: '#D1D5DB', strokeWidth: 1.5 },
        markerEnd: { type: 'arrowclosed' as never, color: '#9CA3AF' },
        labelStyle: { fontSize: 11, fill: '#6B7280' },
      }
    })
    .filter(Boolean) as MindMap['edges']
}
