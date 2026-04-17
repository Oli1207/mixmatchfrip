import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { ordersAPI } from '../../utils/api'
import { formatPrice } from '../../utils/currency'
import {
  FiShoppingBag, FiChevronDown, FiChevronUp, FiPackage, FiCheck,
  FiClock, FiTruck, FiX, FiAlertCircle,
} from 'react-icons/fi'
import './OrdersScreen.css'

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  icon: FiClock,    cls: 'status--pending' },
  confirmed: { label: 'Confirmée',   icon: FiCheck,    cls: 'status--confirmed' },
  shipped:   { label: 'Expédiée',    icon: FiTruck,    cls: 'status--shipped' },
  delivered: { label: 'Livrée',      icon: FiPackage,  cls: 'status--delivered' },
  cancelled: { label: 'Annulée',     icon: FiX,        cls: 'status--cancelled' },
}

const SHIPPING_LABELS = {
  standard: 'Standard (5-7 jours)',
  express:  'Express (2-3 jours)',
  pickup:   'Retrait en magasin',
}

function StatusBadge({ status }) {
  const cfg   = STATUS_CONFIG[status] || { label: status, icon: FiAlertCircle, cls: '' }
  const Icon  = cfg.icon
  return (
    <span className={`ord-status ${cfg.cls}`}>
      <Icon size={11}/>
      {cfg.label}
    </span>
  )
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const date = new Date(order.created_at).toLocaleDateString('fr-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="ord-card">
      <div className="ord-card__head" onClick={() => setOpen(o => !o)}>
        <div className="ord-card__meta">
          <span className="ord-card__number">#{order.order_number}</span>
          <span className="ord-card__date">{date}</span>
        </div>
        <div className="ord-card__right">
          <StatusBadge status={order.status}/>
          <span className="ord-card__total">{formatPrice(order.total)}</span>
          <button className="ord-toggle" aria-label="Détails">
            {open ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}
          </button>
        </div>
      </div>

      {open && (
        <div className="ord-card__body">
          {/* Items */}
          <div className="ord-items">
            {order.items.map(item => (
              <div key={item.id} className="ord-item">
                <div className="ord-item__name">
                  <span className="ord-item__brand">{item.product_brand}</span>
                  {item.product_name}
                </div>
                <div className="ord-item__price">
                  {item.qty} × {formatPrice(item.unit_price)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="ord-summary">
            <div className="ord-summary__row">
              <span>Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="ord-summary__row">
              <span>Livraison ({SHIPPING_LABELS[order.shipping_method] || order.shipping_method})</span>
              <span>{parseFloat(order.shipping_cost) === 0 ? 'Gratuit' : formatPrice(order.shipping_cost)}</span>
            </div>
            {parseFloat(order.tax) > 0 && (
              <div className="ord-summary__row">
                <span>Taxes</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
            )}
            <div className="ord-summary__row ord-summary__row--total">
              <span>Total</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </div>

          {/* Shipping address */}
          <div className="ord-address">
            <div className="ord-address__title">Adresse de livraison</div>
            <p>
              {order.first_name} {order.last_name}<br/>
              {order.address}<br/>
              {order.city}, {order.province} {order.postal_code}
            </p>
            {order.instructions && (
              <p className="ord-address__note">Note : {order.instructions}</p>
            )}
          </div>

          {/* Payment */}
          <div className="ord-payment">
            {order.is_paid ? (
              <span className="ord-payment--paid"><FiCheck size={12}/> Payée</span>
            ) : (
              <span className="ord-payment--unpaid"><FiClock size={12}/> En attente de paiement</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdersScreen() {
  const navigate   = useNavigate()
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const [orders,   setOrders]  = useState([])
  const [loading,  setLoading] = useState(true)
  const [error,    setError]   = useState(null)

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    ordersAPI.list()
      .then(({ data }) => { setOrders(data); setLoading(false) })
      .catch(() => { setError('Impossible de charger vos commandes.'); setLoading(false) })
  }, [])

  return (
    <div className="ord-page">
      <div className="ord-container">
        <div className="ord-header">
          <h1 className="ord-title">Mes commandes</h1>
          <p className="ord-subtitle">
            {loading ? '' : `${orders.length} commande${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="ord-loading">
            <div className="acc-spinner"/>
          </div>
        ) : error ? (
          <div className="ord-error">
            <FiAlertCircle size={20}/>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="ord-empty">
            <FiShoppingBag size={48} style={{ color:'var(--gray-text)', marginBottom:16 }}/>
            <h2>Aucune commande pour l'instant</h2>
            <p>Vous n'avez pas encore passé de commande.</p>
            <Link to="/catalogue" className="ord-cta">Parcourir la boutique</Link>
          </div>
        ) : (
          <div className="ord-list">
            {orders.map(order => (
              <OrderCard key={order.id} order={order}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
