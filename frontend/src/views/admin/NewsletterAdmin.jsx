import { useEffect, useState } from 'react'
import { FiMail, FiTrash2, FiDownload, FiRefreshCw } from 'react-icons/fi'
import { adminAPI } from '../../utils/adminApi'

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState([])
  const [count,       setCount]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [deleting,    setDeleting]    = useState(null)
  const [search,      setSearch]      = useState('')

  const load = () => {
    setLoading(true)
    adminAPI.newsletter.list()
      .then(({ data }) => {
        setSubscribers(data.results)
        setCount(data.count)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Désinscrire cet email ?')) return
    setDeleting(id)
    try {
      await adminAPI.newsletter.delete(id)
      setSubscribers(s => s.filter(x => x.id !== id))
      setCount(c => c - 1)
    } finally {
      setDeleting(null)
    }
  }

  const exportCSV = () => {
    const rows = [['Email', 'Date inscription'], ...subscribers.map(s => [s.email, new Date(s.created_at).toLocaleDateString('fr-CA')])]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'newsletter.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Newsletter</h1>
          <p className="adm-page-sub">{count} abonné{count !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="adm-btn adm-btn--outline" onClick={load}>
            <FiRefreshCw size={14}/> Actualiser
          </button>
          <button className="adm-btn adm-btn--gold" onClick={exportCSV} disabled={subscribers.length === 0}>
            <FiDownload size={14}/> Exporter CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="adm-input"
          placeholder="Rechercher un email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-text)' }}>
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-text)' }}>
            <FiMail size={28} style={{ marginBottom: 10, opacity: 0.4 }}/>
            <p style={{ margin: 0 }}>Aucun abonné{search ? ' pour cette recherche' : ' pour l\'instant'}.</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Date d'inscription</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--gray-text)', fontSize: 12 }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiMail size={13} style={{ color: 'var(--gold)', flexShrink: 0 }}/>
                        <span style={{ fontWeight: 500 }}>{s.email}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-text)', fontSize: 13 }}>
                      {new Date(s.created_at).toLocaleDateString('fr-CA', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </td>
                    <td>
                      <button
                        className="adm-btn-icon adm-btn-icon--danger"
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                        title="Désinscrire"
                      >
                        <FiTrash2 size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
