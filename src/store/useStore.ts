import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react'
import type {
  Language,
  MindEdge,
  MindMap,
  MindNode,
  MindNodeData,
  NodeKind,
  Settings,
  Toast,
  Tool,
} from '../types'
import { uid } from '../lib/utils/id'
import { buildDemo, buildTemplate } from '../templates'
import {
  clearAll,
  deleteMap,
  loadLanguage,
  loadMaps,
  loadSettings,
  saveLanguage,
  saveMap,
  saveSettings,
} from '../lib/storage/db'

export const DEFAULT_SETTINGS: Settings = {
  gridType: 'dots',
  gridSize: 24,
  snap: true,
  showMinimap: true,
  autosave: true,
  theme: 'light',
  aiApiKey: '',
}

type SaveState = 'saved' | 'saving'

interface CtxMenu {
  x: number
  y: number
  flowX: number
  flowY: number
  target: 'pane' | 'node' | 'edge'
  nodeId?: string
  edgeId?: string
}

interface UIState {
  sidebarOpen: boolean
  propertiesOpen: boolean
  commandOpen: boolean
  searchOpen: boolean
  settingsOpen: boolean
  aiOpen: boolean
  templatesOpen: boolean
  contextMenu: CtxMenu | null
  saveState: SaveState
}

interface HistoryEntry {
  nodes: MindNode[]
  edges: MindEdge[]
}

interface AppStore {
  ready: boolean
  language: Language
  settings: Settings
  maps: MindMap[]
  activeMapId: string | null
  tool: Tool
  ui: UIState
  rf: unknown | null
  past: HistoryEntry[]
  future: HistoryEntry[]
  clipboard: HistoryEntry | null
  toasts: Toast[]

  init: () => Promise<void>
  setLanguage: (l: Language) => void
  updateSettings: (p: Partial<Settings>) => void
  setTool: (t: Tool) => void
  setUi: (p: Partial<UIState>) => void
  setRf: (rf: unknown) => void
  toast: (message: string, kind?: Toast['kind']) => void
  dismissToast: (id: string) => void

  activeMap: () => MindMap | null
  createMap: (name?: string, icon?: string, templateId?: string) => void
  openMap: (id: string) => void
  renameActive: (name: string) => void
  toggleFavorite: (id: string) => void
  trashMap: (id: string) => void
  restoreMap: (id: string) => void
  deleteForever: (id: string) => void
  clearAllData: () => Promise<void>

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  addNode: (kind: NodeKind, position: { x: number; y: number }, extra?: Partial<MindNodeData>) => string
  updateNode: (id: string, data: Partial<MindNodeData>) => void
  deleteSelected: () => void
  duplicateSelected: () => void
  copySelected: () => void
  paste: () => void
  selectAll: () => void
  deleteNode: (id: string) => void
  updateEdge: (id: string, patch: Partial<MindEdge>) => void
  toggleCollapse: (id: string) => void
  insertNoteOnEdge: (edgeId: string) => void
  detachOnLineNode: (nodeId: string) => void
  groupSelected: () => void
  ungroupNode: (id: string) => void

  commit: () => void
  undo: () => void
  redo: () => void

  toggleGridType: () => void
  toggleSnap: () => void
  toggleMinimap: () => void
}

const MAX_HISTORY = 80

function snapshot(m: MindMap): HistoryEntry {
  return {
    nodes: m.nodes.map((n) => ({ ...n, data: { ...n.data } })),
    edges: m.edges.map((e) => ({ ...e })),
  }
}

function patchActive(maps: MindMap[], id: string | null, fn: (m: MindMap) => MindMap): MindMap[] {
  return maps.map((m) => (m.id === id ? fn(m) : m))
}

export const useStore = create<AppStore>((set, get) => ({
  ready: false,
  language: 'en',
  settings: DEFAULT_SETTINGS,
  maps: [],
  activeMapId: null,
  tool: 'select',
  ui: {
    sidebarOpen: true,
    propertiesOpen: true,
    commandOpen: false,
    searchOpen: false,
    settingsOpen: false,
    aiOpen: false,
    templatesOpen: false,
    contextMenu: null,
    saveState: 'saved',
  },
  rf: null,
  past: [],
  future: [],
  clipboard: null,
  toasts: [],

  init: async () => {
    const [maps, savedSettings, lang] = await Promise.all([loadMaps(), loadSettings(), loadLanguage()])
    const settings = {
      ...DEFAULT_SETTINGS,
      ...(savedSettings ?? {}),
      ...(typeof window !== 'undefined' && window.innerWidth < 768 ? { showMinimap: false } : {}),
    }
    let nextMaps = maps
    if (nextMaps.length === 0) {
      const demo = buildDemo()
      const m: MindMap = {
        id: uid('map'),
        name: 'My First Map',
        icon: '🗺️',
        nodes: demo.nodes,
        edges: demo.edges,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        favorite: true,
      }
      nextMaps = [m]
      await saveMap(m)
    }
    set({
      ready: true,
      maps: nextMaps,
      activeMapId: nextMaps.find((m) => !m.inTrash)?.id ?? nextMaps[0]?.id ?? null,
      settings,
      language: (lang as Language) ?? 'en',
      ui: { ...get().ui, sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true },
    })
  },

  setLanguage: (l) => {
    set({ language: l })
    saveLanguage(l)
    document.documentElement.lang = l
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
  },

  updateSettings: (p) => {
    const settings = { ...get().settings, ...p }
    set({ settings })
    saveSettings(settings)
  },

  setTool: (tool) => set({ tool }),
  setUi: (p) => set({ ui: { ...get().ui, ...p } }),
  setRf: (rf) => set({ rf }),

  toast: (message, kind = 'success') => {
    const t: Toast = { id: uid('toast'), message, kind }
    set({ toasts: [...get().toasts, t] })
    setTimeout(() => get().dismissToast(t.id), 2600)
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  activeMap: () => get().maps.find((m) => m.id === get().activeMapId) ?? null,

  createMap: (name, icon, templateId) => {
    const built = templateId ? buildTemplate(templateId) : null
    const m: MindMap = {
      id: uid('map'),
      name: name ?? 'Untitled',
      icon: icon ?? '🧠',
      nodes: built?.nodes ?? [],
      edges: built?.edges ?? [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      favorite: false,
    }
    set({ maps: [m, ...get().maps], activeMapId: m.id, past: [], future: [] })
    saveMap(m)
  },

  openMap: (id) => {
    set({ activeMapId: id, past: [], future: [] })
  },

  renameActive: (name) => {
    set({ maps: patchActive(get().maps, get().activeMapId, (m) => ({ ...m, name, updatedAt: Date.now() })) })
  },

  toggleFavorite: (id) => {
    set({ maps: get().maps.map((m) => (m.id === id ? { ...m, favorite: !m.favorite } : m)) })
  },

  trashMap: (id) => {
    set({
      maps: get().maps.map((m) => (m.id === id ? { ...m, inTrash: true } : m)),
      activeMapId: get().activeMapId === id ? (get().maps.find((m) => !m.inTrash && m.id !== id)?.id ?? null) : get().activeMapId,
    })
  },

  restoreMap: (id) => {
    set({ maps: get().maps.map((m) => (m.id === id ? { ...m, inTrash: false } : m)) })
  },

  deleteForever: (id) => {
    set({ maps: get().maps.filter((m) => m.id !== id) })
    deleteMap(id)
  },

  clearAllData: async () => {
    await clearAll()
    set({ maps: [], activeMapId: null, past: [], future: [] })
  },

  onNodesChange: (changes) => {
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        nodes: applyNodeChanges(changes, m.nodes) as unknown as MindNode[],
        updatedAt: Date.now(),
      })),
    })
  },

  onEdgesChange: (changes) => {
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => {
        const next = applyEdgeChanges(changes, m.edges) as unknown as MindEdge[]
        return {
          ...m,
          edges: next.map((e) => {
            if (e.selected) {
              const base = (e.data?.baseStroke as string | undefined) ?? (e.style?.stroke as string | undefined) ?? '#D1D5DB'
              return {
                ...e,
                data: { ...e.data, baseStroke: base },
                style: { ...e.style, stroke: '#3B82F6', strokeWidth: 2 },
              }
            }
            const base = e.data?.baseStroke as string | undefined
            if (base) {
              return { ...e, data: { ...e.data, baseStroke: undefined }, style: { ...e.style, stroke: base } }
            }
            return e
          }),
          updatedAt: Date.now(),
        }
      }),
    })
  },

  onConnect: (connection) => {
    const id = uid('e')
    get().commit()
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        edges: [
          ...m.edges,
          {
            id,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: 'smoothstep',
            style: { stroke: '#D1D5DB', strokeWidth: 1.5 },
            markerEnd: { type: 'arrowclosed' as never, color: '#9CA3AF' },
            labelStyle: { fontSize: 11, fill: '#6B7280' },
          },
        ],
        updatedAt: Date.now(),
      })),
    })
  },

  addNode: (kind, position, extra) => {
    get().commit()
    const id = uid('n')
    const titles: Record<NodeKind, string> = {
      idea: 'Idea', task: 'Task', note: 'Note', project: 'Project', goal: 'Goal',
      question: 'Question', decision: 'Decision', link: 'Link', image: 'Image',
      text: 'Text', sticky: 'New note…', checklist: 'Checklist',
      'shape-rect': '', 'shape-circle': '', frame: 'Frame',
    }
    const defaultSize: Partial<Record<NodeKind, { w: number; h: number }>> = {
      idea: { w: 224, h: 64 }, task: { w: 224, h: 72 }, note: { w: 224, h: 56 },
      project: { w: 224, h: 88 }, goal: { w: 224, h: 72 }, question: { w: 224, h: 64 },
      decision: { w: 224, h: 64 }, link: { w: 240, h: 44 },
      image: { w: 224, h: 160 }, text: { w: 160, h: 32 }, sticky: { w: 192, h: 120 },
      checklist: { w: 224, h: 96 }, 'shape-rect': { w: 140, h: 90 },
      'shape-circle': { w: 110, h: 110 }, frame: { w: 480, h: 320 },
    }
    const size = (defaultSize as Record<string, { w: number; h: number } | undefined>)[kind]
    const node: MindNode = {
      id,
      type: 'mind',
      position,
      data: { kind, title: titles[kind] ?? '', ...extra },
      selected: true,
      style: size ? { width: size.w, height: size.h } : undefined,
      zIndex: kind === 'frame' ? -1 : undefined,
    }
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        nodes: [...m.nodes.map((n) => ({ ...n, selected: false })), node],
        updatedAt: Date.now(),
      })),
    })
    return id
  },

  updateNode: (id, data) => {
    get().commit()
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        nodes: m.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
        updatedAt: Date.now(),
      })),
    })
  },

  deleteSelected: () => {
    const m = get().activeMap()
    if (!m) return
    const selectedIds = new Set(m.nodes.filter((n) => n.selected).map((n) => n.id))
    if (selectedIds.size === 0) return
    get().commit()
    set({
      maps: patchActive(get().maps, get().activeMapId, (mm) => ({
        ...mm,
        nodes: mm.nodes.filter((n) => !selectedIds.has(n.id)),
        edges: mm.edges.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target) && !e.selected),
        updatedAt: Date.now(),
      })),
    })
  },

  duplicateSelected: () => {
    const m = get().activeMap()
    if (!m) return
    const selectedNodes = m.nodes.filter((n) => n.selected)
    if (selectedNodes.length === 0) return
    get().commit()
    const idMap = new Map<string, string>()
    const newNodes = selectedNodes.map((n) => {
      const id = uid('n')
      idMap.set(n.id, id)
      return {
        ...n,
        id,
        position: { x: n.position.x + 40, y: n.position.y + 40 },
        data: { ...n.data },
        selected: true,
      }
    })
    const internalEdges = m.edges.filter((e) => idMap.has(e.source) && idMap.has(e.target))
    const newEdges = internalEdges.map((e) => ({
      ...e,
      id: uid('e'),
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
      selected: false,
    }))
    set({
      maps: patchActive(get().maps, get().activeMapId, (mm) => ({
        ...mm,
        nodes: [...mm.nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
        edges: [...mm.edges.map((e) => ({ ...e, selected: false })), ...newEdges],
        updatedAt: Date.now(),
      })),
    })
    get().toast('Node duplicated')
  },

  copySelected: () => {
    const m = get().activeMap()
    if (!m) return
    const selectedNodes = m.nodes.filter((n) => n.selected)
    if (selectedNodes.length === 0) return
    const idSet = new Set(selectedNodes.map((n) => n.id))
    const edges = m.edges.filter((e) => idSet.has(e.source) && idSet.has(e.target))
    set({ clipboard: { nodes: selectedNodes.map((n) => ({ ...n })), edges: edges.map((e) => ({ ...e })) } })
  },

  paste: () => {
    const clip = get().clipboard
    if (!clip) return
    get().commit()
    const idMap = new Map<string, string>()
    const newNodes = clip.nodes.map((n) => {
      const id = uid('n')
      idMap.set(n.id, id)
      return { ...n, id, position: { x: n.position.x + 60, y: n.position.y + 60 }, selected: true, data: { ...n.data } }
    })
    const newEdges = clip.edges.map((e) => ({
      ...e,
      id: uid('e'),
      source: idMap.get(e.source) ?? e.source,
      target: idMap.get(e.target) ?? e.target,
      selected: false,
    }))
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        nodes: [...m.nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
        edges: [...m.edges.map((e) => ({ ...e, selected: false })), ...newEdges],
        updatedAt: Date.now(),
      })),
    })
  },

  selectAll: () => {
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        nodes: m.nodes.map((n) => ({ ...n, selected: true })),
        edges: m.edges.map((e) => ({ ...e, selected: true })),
      })),
    })
  },

  deleteNode: (id) => {
    get().commit()
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        nodes: m.nodes.filter((n) => n.id !== id),
        edges: m.edges.filter((e) => e.source !== id && e.target !== id),
        updatedAt: Date.now(),
      })),
    })
  },

  insertNoteOnEdge: (edgeId) => {
    const m = get().activeMap()
    if (!m) return
    const edge = m.edges.find((e) => e.id === edgeId)
    if (!edge) return
    const src = m.nodes.find((n) => n.id === edge.source)
    const tgt = m.nodes.find((n) => n.id === edge.target)
    if (!src || !tgt) return
    get().commit()
    const id = uid('n')
    const node: MindNode = {
      id,
      type: 'mind',
      position: { x: (src.position.x + tgt.position.x) / 2 - 80, y: (src.position.y + tgt.position.y) / 2 - 24 },
      style: { width: 160, height: 48 },
      data: { kind: 'note', title: 'Note', onLine: true },
      selected: true,
    }
    const inEdge: MindEdge = { ...edge, id: uid('e'), source: src.id, target: id }
    const outEdge: MindEdge = { ...edge, id: uid('e'), source: id, target: tgt.id }
    set({
      maps: patchActive(get().maps, get().activeMapId, (mm) => ({
        ...mm,
        nodes: [...mm.nodes.map((n) => ({ ...n, selected: false })), node],
        edges: [...mm.edges.filter((e) => e.id !== edgeId), inEdge, outEdge],
        updatedAt: Date.now(),
      })),
    })
    get().toast('Note attached to line')
  },

  detachOnLineNode: (nodeId) => {
    const m = get().activeMap()
    if (!m) return
    const inE = m.edges.find((e) => e.target === nodeId)
    const outE = m.edges.find((e) => e.source === nodeId)
    if (!inE || !outE) return
    const node = m.nodes.find((n) => n.id === nodeId)
    if (!node) return
    get().commit()
    set({
      maps: patchActive(get().maps, get().activeMapId, (mm) => ({
        ...mm,
        nodes: mm.nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, onLine: false } } : n)),
        edges: [
          ...mm.edges.filter((e) => e.id !== inE.id && e.id !== outE.id),
          { ...inE, id: uid('e'), source: inE.source, target: outE.target },
        ],
        updatedAt: Date.now(),
      })),
    })
    get().toast('Detached from line')
  },

  updateEdge: (id, patch) => {
    get().commit()
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        edges: m.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        updatedAt: Date.now(),
      })),
    })
  },

  toggleCollapse: (id) => {
    get().commit()
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        nodes: m.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, collapsed: !n.data.collapsed } } : n)),
      })),
    })
  },

  groupSelected: () => {
    const m = get().activeMap()
    if (!m) return
    const sel = m.nodes.filter((n) => n.selected && n.data.kind !== 'frame')
    if (sel.length < 2) return
    get().commit()
    const xs = sel.map((n) => n.position.x)
    const ys = sel.map((n) => n.position.y)
    const minX = Math.min(...xs) - 24
    const minY = Math.min(...ys) - 48
    const maxX = Math.max(...xs.map((x, i) => x + (sel[i].measured?.width ?? 220))) + 24
    const maxY = Math.max(...ys.map((y, i) => y + (sel[i].measured?.height ?? 80))) + 24
    const frameId = uid('n')
    const frame: MindNode = {
      id: frameId,
      type: 'mind',
      position: { x: minX, y: minY },
      style: { width: maxX - minX, height: maxY - minY },
      data: { kind: 'frame', title: 'Group', color: '#F3F4F6' },
      zIndex: -1,
    }
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        nodes: [...m.nodes, frame],
        updatedAt: Date.now(),
      })),
    })
  },

  ungroupNode: (id) => {
    get().commit()
    set({
      maps: patchActive(get().maps, get().activeMapId, (m) => ({
        ...m,
        nodes: m.nodes.filter((n) => n.id !== id || n.data.kind !== 'frame'),
        updatedAt: Date.now(),
      })),
    })
  },

  commit: () => {
    const m = get().activeMap()
    if (!m) return
    set({ past: [...get().past.slice(-MAX_HISTORY + 1), snapshot(m)], future: [] })
  },

  undo: () => {
    const m = get().activeMap()
    if (!m || get().past.length === 0) return
    const prev = get().past[get().past.length - 1]
    set({
      past: get().past.slice(0, -1),
      future: [snapshot(m), ...get().future],
      maps: patchActive(get().maps, get().activeMapId, (mm) => ({ ...mm, nodes: prev.nodes, edges: prev.edges, updatedAt: Date.now() })),
    })
  },

  redo: () => {
    const m = get().activeMap()
    if (!m || get().future.length === 0) return
    const next = get().future[0]
    set({
      future: get().future.slice(1),
      past: [...get().past, snapshot(m)],
      maps: patchActive(get().maps, get().activeMapId, (mm) => ({ ...mm, nodes: next.nodes, edges: next.edges, updatedAt: Date.now() })),
    })
  },

  toggleGridType: () => {
    const order: Settings['gridType'][] = ['dots', 'lines', 'none']
    const cur = get().settings.gridType
    get().updateSettings({ gridType: order[(order.indexOf(cur) + 1) % order.length] })
  },
  toggleSnap: () => get().updateSettings({ snap: !get().settings.snap }),
  toggleMinimap: () => get().updateSettings({ showMinimap: !get().settings.showMinimap }),
}))

// Persist the active map whenever it changes (debounced).
let saveTimer: ReturnType<typeof setTimeout> | null = null
useStore.subscribe((state, prev) => {
  const changedMaps = state.maps !== prev.maps
  if (!changedMaps || !state.settings.autosave) return
  useStore.setState({ ui: { ...useStore.getState().ui, saveState: 'saving' } })
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const maps = useStore.getState().maps
    for (const m of maps) saveMap(m).catch(() => {})
    useStore.setState({ ui: { ...useStore.getState().ui, saveState: 'saved' } })
  }, 600)
})
