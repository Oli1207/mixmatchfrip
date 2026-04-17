import { useEffect, useState } from 'react'
import {
  FiUsers, FiShoppingCart, FiHeart, FiChevronDown, FiChevronUp,
  FiRefreshCw, FiMail, FiPhone, FiPackage
} from 'react-icons/fi'
import { adminAPI } from '../../utils/adminApi'

function ClientRow({ client }) {
  const [open, setOpen] = useState(false)

  const hasCart     = client.cart.length > 0
  const hasWishlist = client.wishlist.length > 0

  return (
    <>
      <tr
        style={{ cursor: 'pointer', background: open ? '#fffbf2' : undefined }}
        onClick={() => setOpen(o => !o)}
      >
        <td>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontWeight: 600 }}>{client.full_name || '—'}</span>
            <span style={{ fontSize: 12, color: 'var(--gray-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiMail size={11}/> {client.email}
            </span>
            {client.phone && (
              <span style={{ fontSize: 12, color: 'var(--gray-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiPhone size={11}/> {client.phone}
              </span>
            )}
          </div>
        </td>
        <td style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 700 }}>{client.orders_count}</span>
        </td>
        <td>
          {hasCart ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#fff8e1', color: '#92620a', borderRadius: 20,
              fontSize: 12, fontWeight: 600, padding: '3px 10px'
            }}>
              <FiShoppingCart size={11}/> {client.cart.length} article{client.cart.length > 1 ? 's' : ''} — {client.cart_total.toFixed(2)} $
            </span>
          ) : (
            <span style={{ color: 'var(--gray-text)', fontSize: 12 }}>Vide</span>
          )}
        </td>
        <td>
          {hasWishlist ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#fff0f3', color: '#c0392b', borderRadius: 20,
              fontSize: 12, fontWeight: 600, padding: '3px 10px'
            }}>
              <FiHeart size={11}/> {client.wishlist.length} favori{client.wishlist.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span style={{ color: 'var(--gray-text)', fontSize: 12 }}>Vide</span>
          )}
        </td>
        <td style={{ color: 'var(--gray-text)', fontSize: 12 }}>
          {new Date(client.date_joined).toLocaleDateString('fr-CA')}
        </td>
        <td>
          {(hasCart || hasWishlist) && (
            open ? <FiChevronUp size={15} style={{ color: 'var(--gold)' }}/>
                 : <FiChevronDown size={15} style={{ color: 'var(--gray-text)' }}/>
          )}
        </td>
      </tr>

      {/* Détail panier + wishlist */}
      {open && (hasCart || hasWishlist) && (
        <tr>
          <td colSpan={6} style={{ background: '#fafafa', padding: '0 0 12px' }}>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: hasCart && hasWishlist ? '1fr 1fr' : '1fr', gap: 24 }}>

              {/* Panier */}
              {hasCart && (
                <div>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiShoppingCart size={13} style={{ color: 'var(--gold)' }}/> Panier ({client.cart.length} article{client.cart.length > 1 ? 's' : ''})
                    <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#92620a' }}>
                      {client.cart_total.toFixed(2)} $
                    </span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {client.cart.map(item => (
                      <div key={item.product_id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#fff', borderRadius: 7, padding: '8px 10px',
                        border: '1px solid #f0f0f0'
                      }}>
                        {item.image ? (
                          <img src={item.image} alt={item.product_name}
                            style={{ width: 40, height: 50, objectFit: 'contain', borderRadius: 4, background: '#f8f8f8', flexShrink: 0 }}/>
                        ) : (
                          <div style={{ width: 40, height: 50, background: '#f0f0f0', borderRadius: 4, flexShrink: 0 }}/>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.brand && <span style={{ color: 'var(--gold)', marginRight: 4 }}>{item.brand}</span>}
                            {item.product_name}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--gray-text)' }}>
                            {item.qty} × {item.price.toFixed(2)} $ = <strong>{item.line_total.toFixed(2)} $</strong>
                          </p>
                        </div>
                        <a href={`/product/${item.slug}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: 'var(--gold)', textDecoration: 'none', flexShrink: 0 }}
                          onClick={e => e.stopPropagation()}>
                          Voir →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist */}
              {hasWishlist && (
                <div>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiHeart size={13} style={{ color: '#e74c3c' }}/> Favoris ({client.wishlist.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {client.wishlist.map(item => (
                      <div key={item.product_id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#fff', borderRadius: 7, padding: '8px 10px',
                        border: '1px solid #f0f0f0'
                      }}>
                        {item.image ? (
                          <img src={item.image} alt={item.product_name}
                            style={{ width: 40, height: 50, objectFit: 'contain', borderRadius: 4, background: '#f8f8f8', flexShrink: 0 }}/>
                        ) : (
                          <div style={{ width: 40, height: 50, background: '#f0f0f0', borderRadius: 4, flexShrink: 0 }}/>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.brand && <span style={{ color: 'var(--gold)', marginRight: 4 }}>{item.brand}</span>}
                            {item.product_name}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--gray-text)' }}>
                            {item.price.toFixed(2)} $
                          </p>
                        </div>
                        <a href={`/product/${item.slug}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: 'var(--gold)', textDecoration: 'none', flexShrink: 0 }}
                          onClick={e => e.stopPropagation()}>
                          Voir →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function ClientsAdmin() {
  const [clients, setClients] = useState([])
  const [count,   setCount]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  const load = () => {
    setLoading(true)
    adminAPI.clients.list()
      .then(({ data }) => {
        setClients(data.results)
        setCount(data.count)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return !q || c.email.toLowerCase().includes(q) || (c.full_name || '').toLowerCase().includes(q)
  })

  const totalCartValue = clients.reduce((s, c) => s + c.cart_total, 0)
  const withCart       = clients.filter(c => c.cart.length > 0).length
  const withWishlist   = clients.filter(c => c.wishlist.length > 0).length

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Clients</h1>
          <p className="adm-page-sub">{count} compte{count !== 1 ? 's' : ''} enregistré{count !== 1 ? 's' : ''}</p>
        </div>
        <button className="adm-btn adm-btn--outline" onClick={load}>
          <FiRefreshCw size={14}/> Actualiser
        </button>
      </div>

      {/* Résumé */}
      {!loading && (
        <div className="adm-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
          <div className="adm-stat">
            <div className="adm-stat__label"><FiUsers size={12} style={{ marginRight: 4 }}/>Clients totaux</div>
            <div className="adm-stat__value">{count}</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat__label"><FiShoppingCart size={12} style={{ marginRight: 4 }}/>Paniers actifs</div>
            <div className="adm-stat__value">{withCart}</div>
            <div className="adm-stat__sub">Valeur totale : {totalCartValue.toFixed(2)} $</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat__label"><FiHeart size={12} style={{ marginRight: 4 }}/>Avec favoris</div>
            <div className="adm-stat__value">{withWishlist}</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="adm-input"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 340 }}
        />
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-text)' }}>
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-text)' }}>
            <FiUsers size={28} style={{ marginBottom: 10, opacity: 0.4 }}/>
            <p style={{ margin: 0 }}>Aucun client{search ? ' pour cette recherche' : ''}.</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th style={{ textAlign: 'center' }}>Commandes</th>
                  <th>Panier</th>
                  <th>Favoris</th>
                  <th>Inscrit le</th>
                  <th style={{ width: 32 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <ClientRow key={client.id} client={client}/>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'var(--gray-text)', marginTop: 12 }}>
        Cliquez sur une ligne pour voir le détail du panier et des favoris.
      </p>
    </div>
  )
}
