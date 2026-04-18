/**
 * AnalyticsProvider
 * - Initialise la session au premier rendu
 * - Écoute chaque changement de route → envoie un page_view
 */
import { useEffect, useRef } from 'react'
import { useLocation }       from 'react-router-dom'
import { initSession, events } from './analytics'

// Pages privées/techniques qu'on ne trace pas
const SKIP_PATHS = ['/dashboard', '/payment-success', '/payment-failed']

export default function AnalyticsProvider({ children }) {
  const location    = useLocation()
  const initialized = useRef(false)

  // Initialisation de session (une seule fois)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      initSession()
    }
  }, [])

  // Page view à chaque changement de route
  useEffect(() => {
    const path = location.pathname
    const skip = SKIP_PATHS.some(p => path.startsWith(p))
    if (!skip) {
      events.pageView(path + location.search)
    }
  }, [location.pathname, location.search])

  return children
}
