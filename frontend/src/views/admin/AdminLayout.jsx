import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiGrid, FiPackage, FiShoppingCart, FiTag, FiLogOut, FiExternalLink } from 'react-icons/fi'
import useAuthStore from '../../store/auth'
import { logout } from '../../utils/auth'
import './AdminLayout.css'

const NAV = [
  { to: '/dashboard',          label: 'Tableau de bord', icon: FiGrid },
  { to: '/dashboard/products', label: 'Produits',         icon: FiPackage },
  { to: '/dashboard/orders',   label: 'Commandes',        icon: FiShoppingCart },
  { to: '/dashboard/promos',   label: 'Codes promo',      icon: FiTag },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const user     = useAuthStore(s => s.user)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <span className="adm-sidebar__logo">Mix&Match</span>
          <span className="adm-sidebar__tag">Admin</span>
        </div>

        <nav className="adm-sidebar__nav">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => `adm-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={17}/>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <a href="/" target="_blank" rel="noopener" className="adm-nav-item adm-nav-item--sm">
            <FiExternalLink size={15}/> Voir la boutique
          </a>
          <div className="adm-sidebar__user">
            <div className="adm-sidebar__avatar">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div className="adm-sidebar__user-info">
              <span className="adm-sidebar__user-name">{user?.full_name || 'Admin'}</span>
              <span className="adm-sidebar__user-role">Administratrice</span>
            </div>
            <button className="adm-sidebar__logout" onClick={handleLogout} title="Déconnexion">
              <FiLogOut size={16}/>
            </button>
          </div>
        </div>
      </aside>

      <main className="adm-main">
        <Outlet/>
      </main>
    </div>
  )
}
