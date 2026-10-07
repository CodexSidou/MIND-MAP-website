import type { Node, Edge } from '@xyflow/react'

export type NodeKind =
  | 'idea'
  | 'task'
  | 'note'
  | 'project'
  | 'goal'
  | 'question'
  | 'decision'
  | 'link'
  | 'image'
  | 'text'
  | 'sticky'
  | 'checklist'
  | 'shape-rect'
  | 'shape-circle'
  | 'frame'

export type Status = 'none' | 'todo' | 'in-progress' | 'done' | 'blocked'
export type Priority = 'none' | 'low' | 'medium' | 'high'

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface NodeLink {
  id: string
  label: string
  url: string
}

export interface MindNodeData {
  kind: NodeKind
  title: string
  description?: string
  color?: string
  icon?: string
  status?: Status
  priority?: Priority
  tags?: string[]
  checklist?: ChecklistItem[]
  links?: NodeLink[]
  url?: string
  imageUrl?: string
  progress?: number
  priorityLabel?: string
  editing?: boolean
  collapsed?: boolean
  width?: number
  height?: number
  onLine?: boolean
  [key: string]: unknown
}

export type MindNode = Node<MindNodeData, 'mind'>
export type MindEdge = Edge

export interface MindMap {
  id: string
  name: string
  icon: string
  nodes: MindNode[]
  edges: MindEdge[]
  createdAt: number
  updatedAt: number
  favorite: boolean
  inTrash?: boolean
}

export interface Settings {
  gridType: 'dots' | 'lines' | 'none'
  gridSize: number
  snap: boolean
  showMinimap: boolean
  autosave: boolean
  theme: 'light'
  aiApiKey: string
}

export type Language = 'en' | 'fr' | 'ar' | 'es' | 'de' | 'pt' | 'zh'

export type Tool =
  | 'select'
  | 'hand'
  | 'node'
  | 'text'
  | 'sticky'
  | 'connect'
  | 'rect'
  | 'circle'
  | 'frame'
  | 'image'
  | 'link'
  | 'checklist'

export interface Toast {
  id: string
  message: string
  kind: 'success' | 'error' | 'info'
}
