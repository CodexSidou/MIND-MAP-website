import type { MindNode, MindEdge, NodeKind, MindNodeData } from '../types'
import { uid } from '../lib/utils/id'

let c = 0
function nid() {
  return `n_${++c}_${Math.random().toString(36).slice(2, 7)}`
}

export function mkNode(
  kind: NodeKind,
  title: string,
  x: number,
  y: number,
  extra: Partial<MindNodeData> = {},
): MindNode {
  return {
    id: nid(),
    type: 'mind',
    position: { x, y },
    data: { kind, title, ...extra },
  }
}

export function mkEdge(
  source: string,
  target: string,
  label?: string,
  dashed = false,
): MindEdge {
  return {
    id: `e_${source}_${target}_${Math.random().toString(36).slice(2, 6)}`,
    source,
    target,
    label: label ?? '',
    type: 'smoothstep',
    style: { stroke: '#D1D5DB', strokeWidth: 1.5, ...(dashed ? { strokeDasharray: '6 4' } : {}) },
    markerEnd: { type: 'arrowclosed' as never, color: '#9CA3AF' },
    labelStyle: { fontSize: 11, fill: '#6B7280' },
  }
}

interface TemplateDef {
  id: string
  name: string
  icon: string
  build: () => { nodes: MindNode[]; edges: MindEdge[] }
}

function tree(rootTitle: string, children: string[]): { nodes: MindNode[]; edges: MindEdge[] } {
  const root = mkNode('idea', rootTitle, 0, 0)
  const nodes: MindNode[] = [root]
  const edges: MindEdge[] = []
  const gap = 220
  const totalW = (children.length - 1) * gap
  children.forEach((ch, i) => {
    const child = mkNode('idea', ch, i * gap - totalW / 2, 180, { kind: childKind(ch) })
    nodes.push(child)
    edges.push(mkEdge(root.id, child.id))
  })
  return { nodes, edges }
}

function childKind(_t: string): NodeKind {
  return 'idea'
}

export const templates: TemplateDef[] = [
  {
    id: 'project-planning',
    name: 'Project Planning',
    icon: '📋',
    build: () => tree('Project', ['Idea', 'Research', 'Design', 'Development', 'Testing', 'Launch']),
  },
  {
    id: 'startup',
    name: 'Startup',
    icon: '🚀',
    build: () => tree('Startup', ['Problem', 'Solution', 'Market', 'Competitors', 'Business Model', 'Marketing', 'Roadmap']),
  },
  {
    id: 'website',
    name: 'Website',
    icon: '🌐',
    build: () => tree('Website', ['Requirements', 'UI/UX', 'Frontend', 'Backend', 'Database', 'Testing', 'Deployment']),
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    icon: '🛡️',
    build: () => tree('Cybersecurity', ['Networking', 'Linux', 'Web Security', 'Cryptography', 'Vulnerabilities', 'Incident Response']),
  },
  {
    id: 'study-roadmap',
    name: 'Study Roadmap',
    icon: '🎓',
    build: () => tree('Subject', ['Fundamentals', 'Concepts', 'Practice', 'Projects', 'Revision']),
  },
]

export function buildDemo(): { nodes: MindNode[]; edges: MindEdge[] } {
  c = 0
  const root = mkNode('idea', '🚀 MY PROJECT', 0, 0, { description: 'A connected visual workspace.' })
  const idea = mkNode('idea', '💡 IDEA', -260, 180, { description: 'Build a new platform…' })
  const goal = mkNode('goal', '🎯 GOAL', 260, 180, { progress: 40, description: 'Ship v1 this quarter.' })
  const design = mkNode('idea', '🎨 DESIGN', -400, 360)
  const code = mkNode('task', '💻 CODE', -120, 360, { status: 'in-progress', priority: 'high' })
  const launch = mkNode('goal', '📈 LAUNCH', 260, 360)
  const test = mkNode('task', '🧪 TEST', -260, 540, { status: 'todo' })
  const release = mkNode('idea', '🚀 RELEASE', -260, 720)
  const nodes = [root, idea, goal, design, code, launch, test, release]
  const edges = [
    mkEdge(root.id, idea.id),
    mkEdge(root.id, goal.id),
    mkEdge(idea.id, design.id),
    mkEdge(idea.id, code.id),
    mkEdge(goal.id, launch.id),
    mkEdge(design.id, test.id),
    mkEdge(code.id, test.id),
    mkEdge(test.id, release.id),
  ]
  return { nodes, edges }
}

export function buildTemplate(id: string): { nodes: MindNode[]; edges: MindEdge[] } | null {
  const tpl = templates.find((t) => t.id === id)
  if (!tpl) return null
  c = 0
  return tpl.build()
}
