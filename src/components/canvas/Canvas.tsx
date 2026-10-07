import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  ReactFlow, Background, BackgroundVariant, MiniMap, Panel, useReactFlow, useViewport,
  type Node, type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStore } from '../../store/useStore'
import MindNodeComponent from '../nodes/MindNode'
import type { MindNode, NodeKind } from '../../types'

const nodeTypes = { mind: MindNodeComponent }

const KIND_BY_TOOL: Record<string, NodeKind | null> = {
  node: 'idea', text: 'text', sticky: 'sticky', rect: 'shape-rect',
  circle: 'shape-circle', frame: 'frame', link: 'link', image: 'image', checklist: 'checklist', connect: null, hand: null, select: null,
}

function hiddenIds(nodes: MindNode[], edges: Edge[]): Set<string> {
  const hidden = new Set<string>()
  const collapsedSources = new Set(nodes.filter((n) => n.data.collapsed).map((n) => n.id))
  if (collapsedSources.size === 0) return hidden
  const queue = [...collapsedSources]
  while (queue.length) {
    const cur = queue.shift()!
    for (const e of edges) {
      if (e.source === cur) {
        if (!hidden.has(e.target)) { hidden.add(e.target); queue.push(e.target) }
      }
    }
  }
  return hidden
}

export default function Canvas() {
  const active = useStore((s) => s.activeMap())
  const settings = useStore((s) => s.settings)
  const tool = useStore((s) => s.tool)
  const setUi = useStore((s) => s.setUi)
  const setTool = useStore((s) => s.setTool)
  const onNodesChange = useStore((s) => s.onNodesChange)
  const onEdgesChange = useStore((s) => s.onEdgesChange)
  const onConnect = useStore((s) => s.onConnect)
  const addNode = useStore((s) => s.addNode)
  const commit = useStore((s) => s.commit)
  const setRf = useStore((s) => s.setRf)
  const toggleCollapse = useStore((s) => s.toggleCollapse)
  const rf = useReactFlow()
  const connectSrc = useRef<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingImagePos = useRef<{ x: number; y: number } | null>(null)
  const lastFramePos = useRef<{ x: number; y: number } | null>(null)
  const [space, setSpace] = useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target as HTMLElement)?.closest('input,textarea,[contenteditable]')) {
        setSpace(true)
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => setSpace(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  React.useEffect(() => { setRf(rf) }, [rf, setRf])

  const { displayNodes, displayEdges } = useMemo(() => {
    if (!active) return { displayNodes: [], displayEdges: [] }
    const hid = hiddenIds(active.nodes, active.edges)
    return {
      displayNodes: active.nodes.map((n) => (hid.has(n.id) ? { ...n, hidden: true } : n)),
      displayEdges: active.edges.map((e) => (hid.has(e.source) || hid.has(e.target) ? { ...e, hidden: true } : e)),
    }
  }, [active])

  const paneClick = useCallback((e: React.MouseEvent) => {
    const state = useStore.getState()
    if (state.ui.contextMenu) state.setUi({ contextMenu: null })
    const kind = KIND_BY_TOOL[tool]
    if (kind === undefined || kind === null) return
    const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    if (kind === 'link') {
      const url = window.prompt('Enter URL')
      if (url) addNode('link', pos, { url, title: url })
    } else if (kind === 'image') {
      pendingImagePos.current = pos
      fileRef.current?.click()
    } else {
      addNode(kind, pos)
    }
    setTool('select')
  }, [tool, rf, addNode, setTool])

  const nodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (tool === 'connect') {
      if (!connectSrc.current) {
        connectSrc.current = node.id
      } else if (connectSrc.current !== node.id) {
        onConnect({ source: connectSrc.current, target: node.id, sourceHandle: null, targetHandle: null })
        connectSrc.current = null
        setTool('select')
      }
    }
  }, [tool, onConnect, setTool])

  const onPaneContextMenu = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault()
    const me = e as React.MouseEvent
    const flow = rf.screenToFlowPosition({ x: me.clientX, y: me.clientY })
    setUi({ contextMenu: { x: me.clientX, y: me.clientY, flowX: flow.x, flowY: flow.y, target: 'pane' } })
  }, [rf, setUi])

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault()
    const flow = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    setUi({ contextMenu: { x: e.clientX, y: e.clientY, flowX: flow.x, flowY: flow.y, target: 'node', nodeId: node.id } })
  }, [rf, setUi])

  const onEdgeContextMenu = useCallback((e: React.MouseEvent, edge: Edge) => {
    e.preventDefault()
    const flow = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    setUi({ contextMenu: { x: e.clientX, y: e.clientY, flowX: flow.x, flowY: flow.y, target: 'edge', edgeId: edge.id } })
  }, [rf, setUi])

  const onNodeDrag = useCallback((_e: MouseEvent | TouchEvent | React.MouseEvent, node: Node) => {
    const kind = (node.data as { kind?: string } | undefined)?.kind
    if (kind !== 'frame') return
    const prev = lastFramePos.current ?? node.position
    const dx = node.position.x - prev.x
    const dy = node.position.y - prev.y
    lastFramePos.current = node.position
    if (dx === 0 && dy === 0) return
    const m = useStore.getState().activeMap()
    if (!m) return
    const w = node.measured?.width ?? Number((node.style as { width?: number } | undefined)?.width) ?? 480
    const h = node.measured?.height ?? Number((node.style as { height?: number } | undefined)?.height) ?? 320
    const moved = new Set<string>()
    for (const n of m.nodes) {
      if (n.id === node.id) continue
      const nx = n.position.x + 80
      const ny = n.position.y + 40
      if (nx >= prev.x && nx <= prev.x + w && ny >= prev.y && ny <= prev.y + h) moved.add(n.id)
    }
    if (moved.size === 0) return
    useStore.setState((s) => ({
      maps: s.maps.map((mm) => mm.id === s.activeMapId
        ? { ...mm, nodes: mm.nodes.map((n) => (moved.has(n.id) ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n)) }
        : mm),
    }))
  }, [])

  const onNodeDragEnd = useCallback(() => { lastFramePos.current = null }, [])

  const onImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !pendingImagePos.current) return
    if (!f.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      addNode('image', pendingImagePos.current!, { imageUrl: String(reader.result), title: f.name })
      pendingImagePos.current = null
    }
    reader.readAsDataURL(f)
    e.target.value = ''
  }, [addNode])

  if (!active) {
    return <div className="flex h-full items-center justify-center text-sm text-gray-400">No mind map selected.</div>
  }

  const panOnDrag = tool === 'hand' || space ? [0, 1, 2] as number[] : [1, 2]

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={paneClick}
        onNodeClick={nodeClick}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onNodeDragStart={() => commit()}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragEnd}
        panOnDrag={panOnDrag}
        selectionOnDrag={tool === 'select'}
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        snapToGrid={settings.snap}
        snapGrid={[settings.gridSize, settings.gridSize]}
        nodesDraggable={tool !== 'hand' && tool !== 'connect'}
        nodesConnectable
        elementsSelectable
        fitView
        minZoom={0.05}
        maxZoom={3}
        className="bg-white"
      >
        {settings.gridType !== 'none' && (
          <Background
            variant={settings.gridType === 'dots' ? BackgroundVariant.Dots : BackgroundVariant.Lines}
            gap={settings.gridSize}
            size={1}
            color={settings.gridType === 'dots' ? '#2E3138' : '#1E2127'}
          />
        )}
        {settings.showMinimap && (
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => {
              const c = (n.data as { color?: string } | undefined)?.color
              return c && /^#/.test(c) ? c : '#3A3D46'
            }}
            maskColor="rgba(0,0,0,0.55)"
            className="!bg-white !border !border-gray-100 rounded-lg"
          />
        )}
        <Panel position="bottom-left">
          <ZoomControls />
        </Panel>
      </ReactFlow>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageFile} />
    </div>
  )
}

function ZoomControls() {
  const rf = useReactFlow()
  const zoom = useViewport().zoom
  const settings = useStore((s) => s.settings)
  const toggleGridType = useStore((s) => s.toggleGridType)
  const toggleSnap = useStore((s) => s.toggleSnap)
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white/95 px-2 py-1.5 text-xs shadow-sm">
      <button aria-label="Zoom out" className="rounded px-1.5 py-0.5 hover:bg-gray-100" onClick={() => rf.zoomOut()}>−</button>
      <span className="w-10 text-center text-gray-600">{Math.round(zoom * 100)}%</span>
      <button aria-label="Zoom in" className="rounded px-1.5 py-0.5 hover:bg-gray-100" onClick={() => rf.zoomIn()}>+</button>
      <button aria-label="Fit view" className="rounded px-1.5 py-0.5 hover:bg-gray-100" onClick={() => rf.fitView({ padding: 0.2 })}>Fit</button>
      <button aria-label="Toggle grid" className={`rounded px-1.5 py-0.5 hover:bg-gray-100 ${settings.gridType !== 'none' ? 'text-blue-600' : 'text-gray-400'}`} onClick={toggleGridType}>Grid</button>
      <button aria-label="Toggle snap" className={`rounded px-1.5 py-0.5 hover:bg-gray-100 ${settings.snap ? 'text-blue-600' : 'text-gray-400'}`} onClick={toggleSnap}>Snap</button>
    </div>
  )
}
