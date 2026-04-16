import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

/**
 * Protège les routes /dashboard/*.
 * Requiert is_staff=true dans le token JWT.
 * Le backend renvoie is_staff dans MyTokenObtainPairSerializer — on le stocke dans allUserData.
 */
export default function AdminRoute({ children }) {
  const allUserData = useAuthStore(s => s.allUserData)

  if (!allUserData) {
    return <Navigate to="/login" replace />
  }

  if (!allUserData.is_staff) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
