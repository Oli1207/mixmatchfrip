import { useEffect, useState, useRef } from 'react'
import './ProductsAdmin.css'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiCheck } from 'react-icons/fi'
import { adminAPI } from '../../utils/adminApi'
import { categoriesAPI } from '../../utils/api'

const CONDITIONS = [
  { value: 'new_with_tags', label: 'Neuf avec étiquette' },
  { value: 'excellent',     label: 'Excellent état' },
  { value: 'very_good',     label: 'Très bon état' },
  { value: 'good',          label: 'Bon état' },
]
const SIZES = ['XS','S','M','L','XL','XXL','unique']

// ── Palette de couleurs mode ──────────────────────────────────────────────────
const COLOR_PALETTE = [
  { hex: '#000000', name: 'Noir' },
  { hex: '#1C1C1C', name: 'Noir charbon' },
  { hex: '#808080', name: 'Gris' },
  { hex: '#C0C0C0', name: 'Gris clair' },
  { hex: '#FFFFFF', name: 'Blanc' },
  { hex: '#F5F5DC', name: 'Beige' },
  { hex: '#E8D5B7', name: 'Crème' },
  { hex: '#D2B48C', name: 'Camel' },
  { hex: '#8B4513', name: 'Marron' },
  { hex: '#722F37', name: 'Bordeaux' },
  { hex: '#DC143C', name: 'Rouge foncé' },
  { hex: '#FF0000', name: 'Rouge' },
  { hex: '#FF6B6B', name: 'Corail' },
  { hex: '#FF7F50', name: 'Saumon' },
  { hex: '#FFC0CB', name: 'Rose pâle' },
  { hex: '#FF69B4', name: 'Rose vif' },
  { hex: '#FFA500', name: 'Orange' },
  { hex: '#FFD700', name: 'Doré' },
  { hex: '#FFFF00', name: 'Jaune' },
  { hex: '#90EE90', name: 'Vert clair' },
  { hex: '#228B22', name: 'Vert' },
  { hex: '#556B2F', name: 'Kaki' },
  { hex: '#ADD8E6', name: 'Bleu clair' },
  { hex: '#4169E1', name: 'Bleu royal' },
  { hex: '#000080', name: 'Marine' },
  { hex: '#EE82EE', name: 'Violet clair' },
  { hex: '#800080', name: 'Mauve' },
  { hex: '#708090', name: 'Ardoise' },
]

const EMPTY_FORM = {
  name:'', brand:'', description:'', price:'', original_price:'',
  size:'S', condition:'excellent', color:[], stock:'1', weight_g:'400',
  category:'', is_available: true,
}

// ── Composant ColorPicker ─────────────────────────────────────────────────────
function ColorPicker({ selected, onChange }) {
  const toggle = (hex) => {
    if (selected.includes(hex)) {
      onChange(selected.filter(c => c !== hex))
    } else {
      onChange([...selected, hex])
    }
  }

  return (
    <div className="adm-color-picker">
      <div className="adm-color-palette">
        {COLOR_PALETTE.map(({ hex, name }) => (
          <button
            key={hex}
            type="button"
            className={`adm-color-swatch${selected.includes(hex) ? ' selected' : ''}`}
            style={{ background: hex, border: hex === '#FFFFFF' ? '1px solid #ddd' : undefined }}
            title={name}
            onClick={() => toggle(hex)}
          >
            {selected.includes(hex) && (
              <span className="adm-color-check" style={{ color: hex === '#FFFFFF' || hex === '#F5F5DC' || hex === '#E8D5B7' || hex === '#FFFF00' || hex === '#C0C0C0' || hex === '#ADD8E6' || hex === '#90EE90' || hex === '#FFD700' ? '#333' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiCheck size={12}/>
              </span>
            )}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="adm-color-selected">
          {selected.map(hex => {
            const found = COLOR_PALETTE.find(c => c.hex === hex)
            return (
              <span key={hex} className="adm-color-tag">
                <span className="adm-color-tag__dot" style={{ background: hex, border: hex === '#FFFFFF' ? '1px solid #ddd' : undefined }} />
                {found?.name || hex}
                <button type="button" onClick={() => toggle(hex)}><FiX size={10}/></button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Gestionnaire d'images ─────────────────────────────────────────────────────
function ImageManager({ productId, existingImages, onExistingDelete, newFiles, onNewFiles, onRemoveNew }) {
  const fileRef = useRef()

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) onNewFiles(files)
    e.target.value = ''
  }

  return (
    <div className="adm-img-manager">
      <div className="adm-img-grid">
        {/* Images existantes */}
        {existingImages.map((img, i) => (
          <div key={img.id} className="adm-img-thumb">
            <img src={img.image} alt={`photo ${i + 1}`} />
            {img.is_main && <span className="adm-img-main-badge">Principale</span>}
            <button
              type="button"
              className="adm-img-del"
              onClick={() => onExistingDelete(img.id)}
              title="Supprimer"
            >
              <FiX size={11}/>
            </button>
          </div>
        ))}
        {/* Nouvelles images (aperçu local) */}
        {newFiles.map((file, i) => (
          <div key={i} className="adm-img-thumb adm-img-thumb--new">
            <img src={URL.createObjectURL(file)} alt={file.name} />
            {existingImages.length === 0 && i === 0 && (
              <span className="adm-img-main-badge">Principale</span>
            )}
            <button
              type="button"
              className="adm-img-del"
              onClick={() => onRemoveNew(i)}
              title="Retirer"
            >
              <FiX size={11}/>
            </button>
          </div>
        ))}
        {/* Bouton ajouter */}
        <button
          type="button"
          className="adm-img-add"
          onClick={() => fileRef.current.click()}
          title="Ajouter des photos"
        >
          <FiUpload size={16}/>
          <span>Ajouter</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}

// ── Modal produit ─────────────────────────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(product ? {
    name:           product.name,
    brand:          product.brand || '',
    description:    product.description || '',
    price:          product.price,
    original_price: product.original_price || '',
    size:           product.size,
    condition:      product.condition,
    color:          Array.isArray(product.color) ? product.color : [],
    stock:          product.stock,
    weight_g:       product.weight_g || 400,
    category:       product.category?.id || '',
    is_available:   product.is_available,
  } : { ...EMPTY_FORM })

  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState(null)
  const [existingImages, setExistingImages] = useState(product?.images || [])
  const [toDelete,       setToDelete]       = useState([])   // IDs of existing images to delete
  const [newImgFiles,    setNewImgFiles]    = useState([])   // new File objects

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleExistingDelete = (id) => {
    setExistingImages(prev => prev.filter(img => img.id !== id))
    setToDelete(prev => [...prev, id])
  }

  const handleNewFiles = (files) => {
    setNewImgFiles(prev => [...prev, ...files])
  }

  const handleRemoveNew = (index) => {
    setNewImgFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      let saved
      if (product) {
        const { data } = await adminAPI.products.update(product.id, form)
        saved = data
      } else {
        const { data } = await adminAPI.products.create(form)
        saved = data
      }

      // Supprimer les images marquées
      await Promise.all(toDelete.map(id => adminAPI.products.deleteImage(saved.id, id)))

      // Uploader les nouvelles images
      for (let i = 0; i < newImgFiles.length; i++) {
        const fd = new FormData()
        fd.append('image', newImgFiles[i])
        // Première image = principale si plus aucune existante
        if (existingImages.length === 0 && i === 0) fd.append('is_main', 'true')
        await adminAPI.products.uploadImage(saved.id, fd)
      }

      onSaved()
    } catch (err) {
      const d = err?.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal__head">
          <h2 className="adm-modal__title">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button className="adm-modal__close" onClick={onClose}><FiX size={18}/></button>
        </div>

        <form className="adm-modal__body" onSubmit={handleSubmit}>
          {error && <div className="adm-modal__error">{error}</div>}

          <div className="adm-form-grid">
            <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="adm-form-label">Nom *</label>
              <input className="adm-input" name="name" value={form.name} onChange={handleChange} required/>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Marque</label>
              <input className="adm-input" name="brand" value={form.brand} onChange={handleChange}/>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Catégorie</label>
              <select className="adm-input adm-select" name="category" value={form.category} onChange={handleChange}>
                <option value="">-- Aucune --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Prix de vente ($) *</label>
              <input className="adm-input" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required/>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Prix original ($)</label>
              <input className="adm-input" name="original_price" type="number" step="0.01" value={form.original_price} onChange={handleChange}/>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Taille</label>
              <select className="adm-input adm-select" name="size" value={form.size} onChange={handleChange}>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">État</label>
              <select className="adm-input adm-select" name="condition" value={form.condition} onChange={handleChange}>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Stock</label>
              <input className="adm-input" name="stock" type="number" min="0" value={form.stock} onChange={handleChange}/>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Poids (grammes)</label>
              <input className="adm-input" name="weight_g" type="number" min="50" step="50" value={form.weight_g} onChange={handleChange} placeholder="400"/>
            </div>
            <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="adm-form-label">Description</label>
              <textarea className="adm-input" name="description" rows={3} value={form.description} onChange={handleChange}/>
            </div>

            {/* ── Couleurs ── */}
            <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="adm-form-label">Couleurs</label>
              <ColorPicker
                selected={form.color}
                onChange={colors => setForm(p => ({ ...p, color: colors }))}
              />
            </div>

            {/* ── Photos ── */}
            <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="adm-form-label">Photos</label>
              <ImageManager
                productId     = {product?.id}
                existingImages = {existingImages}
                onExistingDelete = {handleExistingDelete}
                newFiles      = {newImgFiles}
                onNewFiles    = {handleNewFiles}
                onRemoveNew   = {handleRemoveNew}
              />
            </div>

            <div className="adm-form-group">
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange}/>
                <span className="adm-form-label" style={{ margin:0 }}>Disponible à la vente</span>
              </label>
            </div>
          </div>

          <div className="adm-modal__foot">
            <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Annuler</button>
            <button type="submit" className="adm-btn adm-btn--gold" disabled={saving}>
              {saving ? 'Enregistrement…' : product ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page Produits ─────────────────────────────────────────────────────────────
export default function ProductsAdmin() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [search,     setSearch]     = useState('')
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)

  const load = (q = search) => {
    setLoading(true)
    adminAPI.products.list(q)
      .then(({ data }) => { setProducts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load('')
    categoriesAPI.list().then(({ data }) => setCategories(data))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit définitivement ?')) return
    await adminAPI.products.delete(id)
    load()
  }

  const handleSaved = () => { setModal(null); load() }

  const CONDITION_MAP = {
    new_with_tags: 'Neuf', excellent: 'Excellent', very_good: 'Très bon', good: 'Bon'
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Produits</h1>
          <p className="adm-page-sub">{products.length} article{products.length !== 1 ? 's' : ''} dans la boutique</p>
        </div>
        <button className="adm-btn adm-btn--gold" onClick={() => setModal('new')}>
          <FiPlus size={14}/> Nouveau produit
        </button>
      </div>

      <div className="adm-card">
        <div style={{ marginBottom:16 }}>
          <div className="adm-search-wrap">
            <FiSearch size={14} className="adm-search-ico"/>
            <input className="adm-search-input" placeholder="Rechercher par nom ou marque…"
              value={search}
              onChange={e => { setSearch(e.target.value); load(e.target.value) }}/>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Produit</th><th>Catégorie</th><th>Taille</th>
                <th>État</th><th>Prix</th><th>Stock</th><th>Couleurs</th><th>Statut</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign:'center', color:'var(--gray-text)', padding:32 }}>Chargement…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign:'center', color:'var(--gray-text)', padding:32 }}>Aucun produit trouvé.</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {p.main_image_url
                        ? <img src={p.main_image_url} alt="" style={{ width:36, height:44, objectFit:'cover', borderRadius:3 }}/>
                        : <div style={{ width:36, height:44, background:'#f0f0f0', borderRadius:3 }}/>
                      }
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{p.name}</div>
                        <div style={{ fontSize:11, color:'var(--gray-text)' }}>{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category?.name || '—'}</td>
                  <td>{p.size}</td>
                  <td>{CONDITION_MAP[p.condition] || p.condition}</td>
                  <td>
                    <strong>{p.price} $</strong>
                    {p.original_price && <span style={{ fontSize:11, color:'var(--gray-text)', display:'block' }}>{p.original_price} $</span>}
                  </td>
                  <td>
                    <span style={{ color: p.stock <= 2 ? '#e74c3c' : 'inherit', fontWeight: p.stock <= 2 ? 700 : 400 }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div className="adm-table-colors">
                      {Array.isArray(p.color) && p.color.map(hex => (
                        <span key={hex} className="adm-table-color-dot" style={{ background: hex, border: hex === '#FFFFFF' || hex === '#F5F5DC' ? '1px solid #ddd' : undefined }} title={hex}/>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`adm-badge ${p.is_available ? 'adm-badge--delivered' : 'adm-badge--cancelled'}`}>
                      {p.is_available ? 'En ligne' : 'Masqué'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="adm-btn adm-btn--outline" style={{ padding:'6px 10px' }} onClick={() => setModal(p)}>
                        <FiEdit2 size={13}/>
                      </button>
                      <button className="adm-btn adm-btn--danger" style={{ padding:'6px 10px' }} onClick={() => handleDelete(p.id)}>
                        <FiTrash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ProductModal
          product    = {modal === 'new' ? null : modal}
          categories = {categories}
          onClose    = {() => setModal(null)}
          onSaved    = {handleSaved}
        />
      )}
    </div>
  )
}
