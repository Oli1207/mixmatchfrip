/**
 * AnalyticsProvider
 * - Initialise la session au premier rendu
 * - Écoute chaque changement de route → envoie un page_view
 * - Détecte ?promo=XXXX dans l'URL et sauvegarde le code pour le checkout
 */
import { useEffect, useRef } from 'react'
import { useLocation }       from 'react-router-dom'
import { initSession, events } from './analytics'
import { pendingPromo }        from '../utils/promo'

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

  // Page view + détection ?promo= à chaque changement de route
  useEffect(() => {
    const path = location.pathname

    // ── Détection code promo dans l'URL ─────────────────────────────────────
    // Ex: /catalogue?utm_source=instagram&promo=ETE20
    // Le code est sauvegardé en localStorage et consommé automatiquement au checkout.
    const params = new URLSearchParams(location.search)
    const promoInUrl = params.get('promo')
    if (promoInUrl) {
      pendingPromo.save(promoInUrl)
    }

    // ── Page view ────────────────────────────────────────────────────────────
    const skip = SKIP_PATHS.some(p => path.startsWith(p))
    if (!skip) {
      events.pageView(path + location.search)
    }
  }, [location.pathname, location.search])

  return children
}
