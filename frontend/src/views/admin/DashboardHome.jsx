import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiTrendingUp, FiShoppingCart, FiPackage, FiUsers, FiAlertTriangle, FiClock } from 'react-icons/fi'
import { adminAPI } from '../../utils/adminApi'

const STATUS_LABEL = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  shipped:   'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}
const STATUS_CLASS = {
  pending: 'adm-badge--pending', confirmed: 'adm-badge--confirmed',
  shipped: 'adm-badge--shipped', delivered: 'adm-badge--delivered',
  cancelled: 'adm-badge--cancelled',
}

export default function DashboardHome() {
  const [stats,   setStats]   = useState(null)
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAPI.stats(),
      adminAPI.orders.list({ status: 'pending' }),
    ]).then(([s, o]) => {
      setStats(s.data)
      setOrders(o.data.slice(0, 5))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <div className="adm-page-header">
          <div><h1 className="adm-page-title">Tableau de bord</h1></div>
        </div>
        <div className="adm-stats">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="adm-stat" style={{ height: 90, background: '#f0f0f0', animation: 'none' }}/>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Tableau de bord</h1>
          <p className="adm-page-sub">Bonjour ! Voici un aperçu de votre boutique.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="adm-stats">
        <div className="adm-stat adm-stat--gold">
          <div className="adm-stat__label"><FiTrendingUp size={12} style={{marginRight:4}}/>Revenus totaux</div>
          <div className="adm-stat__value">{stats?.total_revenue?.toFixed(2)} $</div>
          <div className="adm-stat__sub">Commandes payées</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label"><FiShoppingCart size={12} style={{marginRight:4}}/>Commandes</div>
          <div className="adm-stat__value">{stats?.total_orders}</div>
          <div className="adm-stat__sub">{stats?.orders_today} aujourd'hui</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label"><FiPackage size={12} style={{marginRight:4}}/>Produits actifs</div>
          <div className="adm-stat__value">{stats?.total_products}</div>
          <div className="adm-stat__sub">{stats?.low_stock} en stock faible</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label"><FiUsers size={12} style={{marginRight:4}}/>Clients</div>
          <div className="adm-stat__value">{stats?.total_clients}</div>
          <div className="adm-stat__sub">Comptes enregistrés</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Commandes en attente */}
        <div className="adm-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ margin:0, fontSize:14, fontWeight:700 }}>
              <FiClock size={14} style={{ marginRight:6, color:'var(--gold)' }}/>
              Commandes en attente
              {stats?.pending_orders > 0 && (
                <span style={{ marginLeft:8, background:'#e74c3c', color:'#fff', borderRadius:10, fontSize:10, padding:'2px 7px', fontWeight:700 }}>
                  {stats.pending_orders}
                </span>
              )}
            </h3>
            <Link to="/dashboard/orders" style={{ fontSize:12, color:'var(--gold)', textDecoration:'none' }}>
              Voir tout →
            </Link>
          </div>
          {orders.length === 0 ? (
            <p style={{ color:'var(--gray-text)', fontSize:13, textAlign:'center', padding:'20px 0' }}>
              Aucune commande en attente.
            </p>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>N°</th><th>Client</th><th>Total</th><th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.order_number}</strong></td>
                      <td>{o.first_name} {o.last_name}</td>
                      <td>{parseFloat(o.total).toFixed(2)} $</td>
                      <td>
                        <span className={`adm-badge ${STATUS_CLASS[o.status]}`}>
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alertes stock */}
        <div className="adm-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ margin:0, fontSize:14, fontWeight:700 }}>
              <FiAlertTriangle size={14} style={{ marginRight:6, color:'#e74c3c' }}/>
              Stock faible
            </h3>
            <Link to="/dashboard/products" style={{ fontSize:12, color:'var(--gold)', textDecoration:'none' }}>
              Gérer →
            </Link>
          </div>
          {stats?.low_stock === 0 ? (
            <p style={{ color:'var(--gray-text)', fontSize:13, textAlign:'center', padding:'20px 0' }}>
              Tous les stocks sont bons.
            </p>
          ) : (
            <p style={{ fontSize:13, color:'#e74c3c' }}>
              <strong>{stats?.low_stock}</strong> produit(s) ont 2 unités ou moins en stock.
            </p>
          )}

          <div style={{ marginTop: 24, borderTop:'1px solid #f0f0f0', paddingTop:20 }}>
            <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700 }}>Actions rapides</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Link to="/dashboard/products" className="adm-btn adm-btn--gold" style={{ justifyContent:'center' }}>
                <FiPackage size={14}/> Ajouter un produit
              </Link>
              <Link to="/dashboard/orders" className="adm-btn adm-btn--outline" style={{ justifyContent:'center' }}>
                <FiShoppingCart size={14}/> Gérer les commandes
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
