import { useEffect, useState } from 'react'
import { FiSearch, FiChevronDown } from 'react-icons/fi'
import { adminAPI } from '../../utils/adminApi'

const STATUS_OPTIONS = [
  { value: '',          label: 'Tous les statuts' },
  { value: 'pending',   label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'shipped',   label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]
const STATUS_LABEL = {
  pending:'En attente', confirmed:'Confirmée',
  shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée',
}
const STATUS_CLASS = {
  pending:'adm-badge--pending', confirmed:'adm-badge--confirmed',
  shipped:'adm-badge--shipped', delivered:'adm-badge--delivered',
  cancelled:'adm-badge--cancelled',
}

function OrderRow({ order, onStatusChange }) {
  const [open,    setOpen]    = useState(false)
  const [saving,  setSaving]  = useState(false)

  const handleStatus = async (newStatus) => {
    setSaving(true)
    await onStatusChange(order.order_number, newStatus)
    setSaving(false)
  }

  return (
    <>
      <tr style={{ cursor:'pointer' }} onClick={() => setOpen(v => !v)}>
        <td><strong>{order.order_number}</strong></td>
        <td>{order.first_name} {order.last_name}<br/>
          <span style={{ fontSize:11, color:'var(--gray-text)' }}>{order.email}</span>
        </td>
        <td>{order.items?.length} article{order.items?.length !== 1 ? 's' : ''}</td>
        <td><strong>{parseFloat(order.total).toFixed(2)} $</strong></td>
        <td>
          <span className={`adm-badge ${order.is_paid ? 'adm-badge--delivered' : 'adm-badge--pending'}`}>
            {order.is_paid ? 'Payée' : 'Non payée'}
          </span>
        </td>
        <td>
          <span className={`adm-badge ${STATUS_CLASS[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </td>
        <td style={{ fontSize:11, color:'var(--gray-text)' }}>
          {new Date(order.created_at).toLocaleDateString('fr-CA')}
        </td>
        <td onClick={e => e.stopPropagation()}>
          <div style={{ position:'relative', display:'inline-block' }}>
            <select
              className="adm-input adm-select"
              style={{ padding:'5px 28px 5px 8px', fontSize:11, width:130 }}
              value={order.status}
              onChange={e => handleStatus(e.target.value)}
              disabled={saving}
            >
              {STATUS_OPTIONS.filter(s => s.value).map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <FiChevronDown size={11} style={{ position:'absolute', right:7, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--gray-text)' }}/>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={8} style={{ background:'#fafafa', padding:'12px 20px' }}>
            <strong style={{ fontSize:12, textTransform:'uppercase', letterSpacing:0.5, color:'var(--gray-text)' }}>
              Détail de la commande
            </strong>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
              {order.items?.map(item => (
                <div key={item.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span>{item.qty}× <strong>{item.product_name}</strong> ({item.product_brand})</span>
                  <span>{item.line_total?.toFixed(2)} $</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid #e8e8e8', fontSize:12, color:'var(--gray-text)' }}>
              <strong>Livraison :</strong> {order.first_name} {order.last_name} — {order.address}, {order.city} ({order.province}) {order.postal_code}
              &nbsp;·&nbsp;{order.shipping_method}
              {order.instructions && <> · <em>"{order.instructions}"</em></>}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function OrdersAdmin() {
  const [orders,  setOrders]  = useState([])
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('')
  const [loading, setLoading] = useState(true)

  const load = (s = search, f = filter) => {
    setLoading(true)
    adminAPI.orders.list({ search: s, status: f })
      .then(({ data }) => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (orderNumber, newStatus) => {
    await adminAPI.orders.updateStatus(orderNumber, newStatus)
    setOrders(prev =>
      prev.map(o => o.order_number === orderNumber ? { ...o, status: newStatus } : o)
    )
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Commandes</h1>
          <p className="adm-page-sub">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="adm-card">
        <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
          <div className="adm-search-wrap">
            <FiSearch size={14} className="adm-search-ico"/>
            <input className="adm-search-input" placeholder="N° commande, nom, email…"
              value={search}
              onChange={e => { setSearch(e.target.value); load(e.target.value, filter) }}/>
          </div>
          <div style={{ position:'relative' }}>
            <select className="adm-input adm-select" style={{ width:180, paddingRight:32 }}
              value={filter}
              onChange={e => { setFilter(e.target.value); load(search, e.target.value) }}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <FiChevronDown size={13} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--gray-text)' }}/>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>N° commande</th><th>Client</th><th>Articles</th>
                <th>Total</th><th>Paiement</th><th>Statut</th><th>Date</th><th>Changer statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--gray-text)', padding:32 }}>Chargement…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--gray-text)', padding:32 }}>Aucune commande trouvée.</td></tr>
              ) : orders.map(o => (
                <OrderRow key={o.id} order={o} onStatusChange={handleStatusChange}/>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
