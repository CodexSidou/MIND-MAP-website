import React, { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage'
import WorkspacePage from './pages/WorkspacePage'
import { useStore } from './store/useStore'

export default function App() {
  const init = useStore((s) => s.init)
  const ready = useStore((s) => s.ready)
  const language = useStore((s) => s.language)
  const [page, setPage] = useState<'landing' | 'app'>('landing')

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  if (!ready) {
    return <div className="flex h-screen items-center justify-center bg-white text-sm text-gray-400">Loading…</div>
  }

  return page === 'landing' ? (
    <LandingPage onStart={() => setPage('app')} onDemo={() => setPage('app')} />
  ) : (
    <WorkspacePage />
  )
}
