import React, { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage'
import WorkspacePage from './pages/WorkspacePage'
import MobileLandingPage from './pages/MobileLandingPage'
import MobileAppPage from './pages/MobileAppPage'
import { useStore } from './store/useStore'

function useIsMobile(): boolean {
  const [mobile, setMobile] = React.useState(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  )
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const fn = () => setMobile(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return mobile
}

export default function App() {
  const init = useStore((s) => s.init)
  const ready = useStore((s) => s.ready)
  const language = useStore((s) => s.language)
  const [page, setPage] = useState<'landing' | 'app'>('landing')
  const isMobile = useIsMobile()

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
    isMobile ? <MobileLandingPage onStart={() => setPage('app')} /> : <LandingPage onStart={() => setPage('app')} onDemo={() => setPage('app')} />
  ) : (
    isMobile ? <MobileAppPage /> : <WorkspacePage />
  )
}
