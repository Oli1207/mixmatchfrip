import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiChevronDown, FiChevronRight, FiTag } from 'react-icons/fi'
import { adminAPI } from '../../utils/adminApi'
import './CategoriesAdmin.css'

// ── Modal Catégorie ───────────────────────────────────────────────────────────
function CategoryModal({ cat, onClose, onSaved }) {
  const [name,    setName]    = useState(cat?.name || '')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true); setError(null)
    try {
      if (cat) {
        await adminAPI.categories.update(cat.id, { name })
      } else {
        await adminAPI.categories.create({ name })
      }
      onSaved()
    } catch (err) {
      const d = err?.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal adm-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="adm-modal__head">
          <h2 className="adm-modal__title">{cat ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
          <button className="adm-modal__close" onClick={onClose}><FiX size={18}/></button>
        </div>
        <form className="adm-modal__body" onSubmit={handleSubmit}>
          {error && <div className="adm-modal__error">{error}</div>}
          <div className="adm-form-group">
            <label className="adm-form-label">Nom *</label>
            <input className="adm-input" value={name} onChange={e => setName(e.target.value)} required autoFocus/>
          </div>
          <div className="adm-modal__foot" style={{ padding:'16px 0 0', border:'none' }}>
            <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Annuler</button>
            <button type="submit" className="adm-btn adm-btn--gold" disabled={saving}>
              {saving ? 'Enregistrement…' : cat ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Sous-catégorie ──────────────────────────────────────────────────────
function SubcategoryModal({ sub, categories, defaultCategoryId, onClose, onSaved }) {
  const [name,       setName]       = useState(sub?.name || '')
  const [categoryId, setCategoryId] = useState(sub?.category_id || defaultCategoryId || '')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !categoryId) return
    setSaving(true); setError(null)
    try {
      if (sub) {
        await adminAPI.subcategories.update(sub.id, { name, category: categoryId })
      } else {
        await adminAPI.subcategories.create({ name, category: categoryId })
      }
      onSaved()
    } catch (err) {
      const d = err?.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal adm-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="adm-modal__head">
          <h2 className="adm-modal__title">{sub ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'}</h2>
          <button className="adm-modal__close" onClick={onClose}><FiX size={18}/></button>
        </div>
        <form className="adm-modal__body" onSubmit={handleSubmit}>
          {error && <div className="adm-modal__error">{error}</div>}
          <div className="adm-form-group">
            <label className="adm-form-label">Catégorie parente *</label>
            <select className="adm-input adm-select" value={categoryId}
              onChange={e => setCategoryId(e.target.value)} required>
              <option value="">-- Choisir --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Nom *</label>
            <input className="adm-input" value={name} onChange={e => setName(e.target.value)} required autoFocus/>
          </div>
          <div className="adm-modal__foot" style={{ padding:'16px 0 0', border:'none' }}>
            <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Annuler</button>
            <button type="submit" className="adm-btn adm-btn--gold" disabled={saving}>
              {saving ? 'Enregistrement…' : sub ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page Catégories ───────────────────────────────────────────────────────────
export default function CategoriesAdmin() {
  const [categories,    setCategories]   = useState([])
  const [subcategories, setSubcats]      = useState([])
  const [loading,       setLoading]      = useState(true)
  const [expanded,      setExpanded]     = useState({})
  const [catModal,      setCatModal]     = useState(null)  // null | 'new' | {cat object}
  const [subModal,      setSubModal]     = useState(null)  // null | { defaultCategoryId, sub? }

  const load = async () => {
    setLoading(true)
    try {
      const [cRes, sRes] = await Promise.all([
        adminAPI.categories.list(),
        adminAPI.subcategories.list(),
      ])
      setCategories(cRes.data)
      setSubcats(sRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }))

  const handleDeleteCat = async (cat) => {
    const subCount = subcategories.filter(s => s.category_id === cat.id).length
    const msg = subCount > 0
      ? `Supprimer la catégorie "${cat.name}" et ses ${subCount} sous-catégorie(s) ?`
      : `Supprimer la catégorie "${cat.name}" ?`
    if (!confirm(msg)) return
    await adminAPI.categories.delete(cat.id)
    load()
  }

  const handleDeleteSub = async (sub) => {
    if (!confirm(`Supprimer la sous-catégorie "${sub.name}" ?`)) return
    await adminAPI.subcategories.delete(sub.id)
    load()
  }

  const handleSaved = () => {
    setCatModal(null)
    setSubModal(null)
    load()
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Catégories</h1>
          <p className="adm-page-sub">
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''} · {subcategories.length} sous-catégorie{subcategories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="adm-btn adm-btn--outline" onClick={() => setSubModal({ defaultCategoryId: '' })}>
            <FiPlus size={14}/> Sous-catégorie
          </button>
          <button className="adm-btn adm-btn--gold" onClick={() => setCatModal('new')}>
            <FiPlus size={14}/> Catégorie
          </button>
        </div>
      </div>

      <div className="adm-card">
        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:'var(--gray-text)' }}>Chargement…</div>
        ) : categories.length === 0 ? (
          <div className="cat-empty">
            <FiTag size={36} style={{ color:'var(--gray-text)', marginBottom:12 }}/>
            <p>Aucune catégorie. Commencez par en créer une.</p>
            <button className="adm-btn adm-btn--gold" onClick={() => setCatModal('new')}>
              <FiPlus size={14}/> Créer une catégorie
            </button>
          </div>
        ) : (
          <div className="cat-list">
            {categories.map(cat => {
              const subs = subcategories.filter(s => s.category_id === cat.id)
              const open = expanded[cat.id]
              return (
                <div key={cat.id} className="cat-item">
                  <div className="cat-item__head">
                    <button className="cat-item__toggle" onClick={() => toggleExpand(cat.id)} title={open ? 'Réduire' : 'Développer'}>
                      {open ? <FiChevronDown size={15}/> : <FiChevronRight size={15}/>}
                    </button>
                    <div className="cat-item__name">
                      {cat.name}
                      <span className="cat-item__count">{subs.length} sous-catégorie{subs.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="cat-item__actions">
                      <button className="adm-btn adm-btn--outline cat-action-btn"
                        onClick={() => setSubModal({ defaultCategoryId: cat.id })}
                        title="Ajouter une sous-catégorie">
                        <FiPlus size={12}/> Sous-cat.
                      </button>
                      <button className="adm-btn adm-btn--outline cat-action-btn"
                        onClick={() => setCatModal(cat)} title="Modifier">
                        <FiEdit2 size={12}/>
                      </button>
                      <button className="adm-btn adm-btn--danger cat-action-btn"
                        onClick={() => handleDeleteCat(cat)} title="Supprimer">
                        <FiTrash2 size={12}/>
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="cat-subs">
                      {subs.length === 0 ? (
                        <div className="cat-subs__empty">
                          Aucune sous-catégorie.{' '}
                          <button type="button" className="cat-link"
                            onClick={() => setSubModal({ defaultCategoryId: cat.id })}>
                            En ajouter une
                          </button>
                        </div>
                      ) : subs.map(sub => (
                        <div key={sub.id} className="cat-sub-item">
                          <span className="cat-sub-item__name">{sub.name}</span>
                          <div className="cat-sub-item__actions">
                            <button className="adm-btn adm-btn--outline cat-action-btn"
                              onClick={() => setSubModal({ sub, defaultCategoryId: sub.category_id })}>
                              <FiEdit2 size={11}/>
                            </button>
                            <button className="adm-btn adm-btn--danger cat-action-btn"
                              onClick={() => handleDeleteSub(sub)}>
                              <FiTrash2 size={11}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {catModal && (
        <CategoryModal
          cat={catModal === 'new' ? null : catModal}
          onClose={() => setCatModal(null)}
          onSaved={handleSaved}
        />
      )}
      {subModal && (
        <SubcategoryModal
          sub={subModal.sub || null}
          categories={categories}
          defaultCategoryId={subModal.defaultCategoryId}
          onClose={() => setSubModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
