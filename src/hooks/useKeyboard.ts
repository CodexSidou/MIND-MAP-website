import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function useKeyboard() {
  const setTool = useStore((s) => s.setTool)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = !!target.closest('input, textarea, [contenteditable="true"]')
      const mod = e.ctrlKey || e.metaKey

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const s = useStore.getState()
        s.setUi({ commandOpen: !s.ui.commandOpen })
        return
      }
      if (mod && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        const s = useStore.getState()
        s.setUi({ searchOpen: !s.ui.searchOpen })
        return
      }
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        useStore.getState().undo()
        return
      }
      if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault()
        useStore.getState().redo()
        return
      }
      if (mod && e.key.toLowerCase() === 'c') { useStore.getState().copySelected(); return }
      if (mod && e.key.toLowerCase() === 'v') { useStore.getState().paste(); return }
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); useStore.getState().duplicateSelected(); return }
      if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); useStore.getState().selectAll(); return }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        useStore.getState().toast('Workspace saved')
        return
      }

      if (typing) return

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          useStore.getState().deleteSelected()
          break
        case 'v': case 'V': setTool('select'); break
        case 'h': case 'H': setTool('hand'); break
        case 'n': case 'N': setTool('node'); break
        case 't': case 'T': setTool('text'); break
        case 'c': case 'C': setTool('connect'); break
        case 'g': case 'G': setTool('frame'); break
        case '+': case '=': zoomBy(1.2); break
        case '-': case '_': zoomBy(1 / 1.2); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setTool])
}

function zoomBy(factor: number) {
  const rf = useStore.getState().rf as { zoomIn?: (o: { duration: number }) => void; zoomOut?: (o: { duration: number }) => void; zoomTo?: (z: number, o?: object) => void; getViewport?: () => { zoom: number } } | null
  if (!rf?.getViewport || !rf.zoomTo) return
  const z = rf.getViewport().zoom
  rf.zoomTo(Math.min(2.5, Math.max(0.1, z * factor)), { duration: 200 })
}
