import { useEffect, useState } from 'react'
import { setUser } from '../utils/auth'

/**
 * Restaure la session JWT au démarrage (accès + refresh token depuis cookies).
 * Enveloppe toute l'app — routes admin incluses.
 */
export default function AppWrapper({ children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser().finally(() => setReady(true))
  }, [])

  if (!ready) return null

  return <>{children}</>
}
