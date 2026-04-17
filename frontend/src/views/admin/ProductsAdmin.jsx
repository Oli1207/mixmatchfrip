import { useEffect, useState, useRef } from 'react'
import './ProductsAdmin.css'
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiCheck,
  FiImage, FiStar, FiAlertCircle,
} from 'react-icons/fi'
import { adminAPI } from '../../utils/adminApi'
import { categoriesAPI } from '../../utils/api'

const CONDITIONS = [
  { value: 'new_with_tags', label: 'Neuf avec étiquette' },
  { value: 'excellent',     label: 'Excellent état' },
  { value: 'very_good',     label: 'Très bon état' },
  { value: 'good',          label: 'Bon état' },
]
const SIZES = ['XS','S','M','L','XL','XXL','unique','autre']

// ── Palette de couleurs ───────────────────────────────────────────────────────
const COLOR_PALETTE = [
  { hex: '#000000', name: 'Noir' },      { hex: '#1C1C1C', name: 'Noir charbon' },
  { hex: '#808080', name: 'Gris' },      { hex: '#C0C0C0', name: 'Gris clair' },
  { hex: '#FFFFFF', name: 'Blanc' },     { hex: '#F5F5DC', name: 'Beige' },
  { hex: '#E8D5B7', name: 'Crème' },     { hex: '#D2B48C', name: 'Camel' },
  { hex: '#8B4513', name: 'Marron' },    { hex: '#722F37', name: 'Bordeaux' },
  { hex: '#DC143C', name: 'Rouge foncé' },{ hex: '#FF0000', name: 'Rouge' },
  { hex: '#FF6B6B', name: 'Corail' },    { hex: '#FF7F50', name: 'Saumon' },
  { hex: '#FFC0CB', name: 'Rose pâle' }, { hex: '#FF69B4', name: 'Rose vif' },
  { hex: '#FFA500', name: 'Orange' },    { hex: '#FFD700', name: 'Doré' },
  { hex: '#FFFF00', name: 'Jaune' },     { hex: '#90EE90', name: 'Vert clair' },
  { hex: '#228B22', name: 'Vert' },      { hex: '#556B2F', name: 'Kaki' },
  { hex: '#ADD8E6', name: 'Bleu clair' },{ hex: '#4169E1', name: 'Bleu royal' },
  { hex: '#000080', name: 'Marine' },    { hex: '#EE82EE', name: 'Violet clair' },
  { hex: '#800080', name: 'Mauve' },     { hex: '#708090', name: 'Ardoise' },
]

const LIGHT_COLORS = new Set(['#FFFFFF','#F5F5DC','#E8D5B7','#FFFF00','#C0C0C0','#ADD8E6','#90EE90','#FFD700'])

const EMPTY_FORM = {
  name: '', brand: '', price: '', original_price: '',
  size: 'S', size_tag: '', size_recommendation: '',
  condition: 'excellent', color: [], stock: '1', weight_g: '400',
  category: '', subcategory: '', is_available: true,
  material: '', details: '',
  measure_shoulder: '', measure_chest: '', measure_waist: '',
  measure_hips: '', measure_length: '', measure_sleeve: '',
  bullet_1: '', bullet_2: '', bullet_3: '', bullet_4: '',
  description: '', mix_match_tips: '', expert_tip: '',
}

// ── ColorPicker ───────────────────────────────────────────────────────────────
function ColorPicker({ selected, onChange }) {
  const toggle = (hex) => {
    onChange(selected.includes(hex)
      ? selected.filter(c => c !== hex)
      : [...selected, hex])
  }
  return (
    <div className="adm-color-picker">
      <div className="adm-color-palette">
        {COLOR_PALETTE.map(({ hex, name }) => (
          <button key={hex} type="button"
            className={`adm-color-swatch${selected.includes(hex) ? ' selected' : ''}`}
            style={{ background: hex, border: hex === '#FFFFFF' ? '1px solid #ddd' : undefined }}
            title={name}
            onClick={() => toggle(hex)}>
            {selected.includes(hex) && (
              <span className="adm-color-check"
                style={{ color: LIGHT_COLORS.has(hex) ? '#333' : '#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
                <span className="adm-color-tag__dot"
                  style={{ background: hex, border: hex === '#FFFFFF' ? '1px solid #ddd' : undefined }}/>
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

// ── ImageManager amélioré ─────────────────────────────────────────────────────
function ImageManager({ existingImages, onExistingDelete, onSetMain, newFiles, onNewFiles, onRemoveNew, onSetNewMain, newMainIdx }) {
  const fileRef   = useRef()
  const dropRef   = useRef()
  const [dragging, setDragging] = useState(false)

  const handleFiles = (files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imgs.length) onNewFiles(imgs)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="adm-img-manager">
      <div className="adm-img-grid">
        {existingImages.map((img, i) => (
          <div key={img.id} className={`adm-img-thumb${img.is_main ? ' adm-img-thumb--main' : ''}`}>
            <img src={img.image} alt={`photo ${i + 1}`}/>
            {img.is_main && (
              <span className="adm-img-badge adm-img-badge--main"><FiStar size={10}/> Principale</span>
            )}
            {!img.is_main && (
              <button type="button" className="adm-img-set-main" onClick={() => onSetMain(img.id)} title="Définir comme principale">
                <FiStar size={11}/>
              </button>
            )}
            <button type="button" className="adm-img-del" onClick={() => onExistingDelete(img.id)} title="Supprimer">
              <FiX size={11}/>
            </button>
          </div>
        ))}

        {newFiles.map((file, i) => {
          const isMain = existingImages.length === 0 && (newMainIdx !== null ? i === newMainIdx : i === 0)
          return (
            <div key={i} className={`adm-img-thumb adm-img-thumb--new${isMain ? ' adm-img-thumb--main' : ''}`}>
              <img src={URL.createObjectURL(file)} alt={file.name}/>
              {isMain && (
                <span className="adm-img-badge adm-img-badge--main"><FiStar size={10}/> Principale</span>
              )}
              {!isMain && existingImages.length === 0 && (
                <button type="button" className="adm-img-set-main" onClick={() => onSetNewMain(i)} title="Définir comme principale">
                  <FiStar size={11}/>
                </button>
              )}
              <button type="button" className="adm-img-del" onClick={() => onRemoveNew(i)} title="Retirer">
                <FiX size={11}/>
              </button>
            </div>
          )
        })}

        <div
          ref={dropRef}
          className={`adm-img-dropzone${dragging ? ' dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}>
          <FiImage size={22}/>
          <span>Glisser-déposer<br/>ou cliquer</span>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple
        style={{ display: 'none' }}
        onChange={e => { handleFiles(e.target.files); e.target.value = '' }}/>
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'essential',  label: 'Essentiel' },
  { id: 'details',    label: 'Détails & Mesures' },
  { id: 'marketing',  label: 'Marketing' },
  { id: 'photos',     label: 'Photos' },
]

// ── Modal produit ─────────────────────────────────────────────────────────────
function ProductModal({ product, categories, allSubcategories, onClose, onSaved }) {
  const [tab, setTab] = useState('essential')

  const buildInitial = (p) => p ? {
    name: p.name || '', brand: p.brand || '',
    price: p.price || '', original_price: p.original_price || '',
    size: p.size || 'S', size_tag: p.size_tag || '',
    size_recommendation: p.size_recommendation || '',
    condition: p.condition || 'excellent',
    color: Array.isArray(p.color) ? p.color : [],
    stock: p.stock ?? 1, weight_g: p.weight_g ?? 400,
    category: p.category?.id || '', subcategory: p.subcategory?.id || '',
    is_available: p.is_available ?? true,
    material: p.material || '', details: p.details || '',
    measure_shoulder: p.measure_shoulder || '', measure_chest: p.measure_chest || '',
    measure_waist: p.measure_waist || '', measure_hips: p.measure_hips || '',
    measure_length: p.measure_length || '', measure_sleeve: p.measure_sleeve || '',
    bullet_1: p.bullet_1 || '', bullet_2: p.bullet_2 || '',
    bullet_3: p.bullet_3 || '', bullet_4: p.bullet_4 || '',
    description: p.description || '', mix_match_tips: p.mix_match_tips || '',
    expert_tip: p.expert_tip || '',
  } : { ...EMPTY_FORM }

  const [form, setForm]               = useState(buildInitial(product))
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)
  const [existingImages, setExisting] = useState(product?.images || [])
  const [toDelete, setToDelete]       = useState([])
  const [newFiles, setNewFiles]       = useState([])
  const [newMainIdx, setNewMainIdx]   = useState(null)

  // Sous-catégories filtrées selon la catégorie sélectionnée
  const filteredSubs = allSubcategories.filter(s => String(s.category_id) === String(form.category))

  // Reset subcategory si la catégorie change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => {
      const updated = { ...p, [name]: type === 'checkbox' ? checked : value }
      if (name === 'category') updated.subcategory = ''
      return updated
    })
  }

  const handleExistingDelete = (id) => {
    setExisting(prev => prev.filter(img => img.id !== id))
    setToDelete(prev => [...prev, id])
  }

  const handleSetMain = (id) => {
    setExisting(prev => prev.map(img => ({ ...img, is_main: img.id === id })))
  }

  const handleNewFiles = (files) => setNewFiles(prev => [...prev, ...files])
  const handleRemoveNew = (i)     => setNewFiles(prev => prev.filter((_, idx) => idx !== i))
  const handleSetNewMain = (i)    => setNewMainIdx(i)

  const handleSubmit = async (e) => {
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

      // Supprimer images marquées
      await Promise.all(toDelete.map(id => adminAPI.products.deleteImage(saved.id, id)))

      // Mettre à jour l'image principale parmi les existantes
      const mainExisting = existingImages.find(img => img.is_main)
      if (mainExisting && product?.images) {
        const orig = product.images.find(i => i.id === mainExisting.id)
        if (orig && !orig.is_main) {
          // On ne peut pas mettre à jour via l'API actuelle — skip pour l'instant
        }
      }

      // Uploader nouvelles images
      const effectiveMainIdx = newMainIdx !== null ? newMainIdx : 0
      for (let i = 0; i < newFiles.length; i++) {
        const fd = new FormData()
        fd.append('image', newFiles[i])
        if (existingImages.length === 0 && i === effectiveMainIdx) fd.append('is_main', 'true')
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
      <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
        <div className="adm-modal__head">
          <h2 className="adm-modal__title">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button className="adm-modal__close" onClick={onClose}><FiX size={18}/></button>
        </div>

        {/* Tabs */}
        <div className="adm-modal-tabs">
          {TABS.map(t => (
            <button key={t.id} type="button"
              className={`adm-modal-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <form className="adm-modal__body" onSubmit={handleSubmit}>
          {error && <div className="adm-modal__error"><FiAlertCircle size={14}/> {error}</div>}

          {/* ── Tab 1 : Essentiel ── */}
          {tab === 'essential' && (
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
                <label className="adm-form-label">État</label>
                <select className="adm-input adm-select" name="condition" value={form.condition} onChange={handleChange}>
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Catégorie</label>
                <select className="adm-input adm-select" name="category" value={form.category} onChange={handleChange}>
                  <option value="">-- Aucune --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Sous-catégorie</label>
                <select className="adm-input adm-select" name="subcategory" value={form.subcategory} onChange={handleChange}
                  disabled={!form.category || filteredSubs.length === 0}>
                  <option value="">-- Aucune --</option>
                  {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Prix de vente ($) *</label>
                <input className="adm-input" name="price" type="number" step="0.01" min="0"
                  value={form.price} onChange={handleChange} required/>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Prix original ($)</label>
                <input className="adm-input" name="original_price" type="number" step="0.01" min="0"
                  value={form.original_price} onChange={handleChange} placeholder="Barré si soldé"/>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Taille standard</label>
                <select className="adm-input adm-select" name="size" value={form.size} onChange={handleChange}>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Taille étiquette</label>
                <input className="adm-input" name="size_tag" value={form.size_tag} onChange={handleChange}
                  placeholder="Ex: 10, L/G, 8P"/>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Stock</label>
                <input className="adm-input" name="stock" type="number" min="0" value={form.stock} onChange={handleChange}/>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Poids (grammes)</label>
                <input className="adm-input" name="weight_g" type="number" min="50" step="50"
                  value={form.weight_g} onChange={handleChange} placeholder="400"/>
              </div>
              <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginTop:4 }}>
                  <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange}/>
                  <span className="adm-form-label" style={{ margin:0 }}>Disponible à la vente</span>
                </label>
              </div>
            </div>
          )}

          {/* ── Tab 2 : Détails & Mesures ── */}
          {tab === 'details' && (
            <div className="adm-form-grid">
              <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="adm-form-label">Recommandation de taille</label>
                <input className="adm-input" name="size_recommendation" value={form.size_recommendation}
                  onChange={handleChange} placeholder="Ex: Convient à un 8 ajusté"/>
              </div>
              <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="adm-form-label">Matière</label>
                <input className="adm-input" name="material" value={form.material} onChange={handleChange}
                  placeholder="Ex: Crêpe de polyester, légèrement extensible"/>
              </div>
              <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="adm-form-label">Détails de coupe</label>
                <textarea className="adm-input" name="details" rows={3} value={form.details} onChange={handleChange}
                  placeholder="Ex: Coupe fourreau, fermeture éclair invisible au dos, entièrement doublée"/>
              </div>

              {/* Mesures */}
              <div style={{ gridColumn: 'span 2' }}>
                <div className="adm-section-title">Mesures à plat (cm)</div>
              </div>
              {[
                { name: 'measure_shoulder', label: 'Épaule à épaule' },
                { name: 'measure_chest',    label: 'Aisselle à aisselle' },
                { name: 'measure_waist',    label: 'Taille' },
                { name: 'measure_hips',     label: 'Hanches' },
                { name: 'measure_length',   label: 'Longueur totale' },
                { name: 'measure_sleeve',   label: 'Longueur des manches' },
              ].map(({ name, label }) => (
                <div key={name} className="adm-form-group">
                  <label className="adm-form-label">{label}</label>
                  <input className="adm-input" name={name} type="number" step="0.1" min="0"
                    value={form[name]} onChange={handleChange} placeholder="—"/>
                </div>
              ))}

              {/* Couleurs */}
              <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="adm-form-label">Couleurs</label>
                <ColorPicker selected={form.color}
                  onChange={colors => setForm(p => ({ ...p, color: colors }))}/>
              </div>
            </div>
          )}

          {/* ── Tab 3 : Marketing ── */}
          {tab === 'marketing' && (
            <div className="adm-form-grid">
              <div style={{ gridColumn: 'span 2' }}>
                <div className="adm-section-title">Arguments de vente</div>
                <p className="adm-section-hint">Courtes phrases d'accroche affichées en liste sur la fiche produit.</p>
              </div>
              {[1,2,3,4].map(n => (
                <div key={n} className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="adm-form-label">Argument {n}</label>
                  <input className="adm-input" name={`bullet_${n}`} value={form[`bullet_${n}`]}
                    onChange={handleChange} placeholder={n === 1 ? 'Ex: Coupe intemporelle parfaite pour toutes occasions' : ''}/>
                </div>
              ))}
              <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="adm-form-label">Description complète</label>
                <textarea className="adm-input" name="description" rows={4}
                  value={form.description} onChange={handleChange}/>
              </div>
              <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="adm-form-label">Idées Mix & Match</label>
                <textarea className="adm-input" name="mix_match_tips" rows={3}
                  value={form.mix_match_tips} onChange={handleChange}
                  placeholder="Une idée de tenue par ligne&#10;Ex: Avec un jean slim blanc et des mules dorées&#10;Avec un pantalon tailleur beige et des escarpins nude"/>
              </div>
              <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="adm-form-label">Conseil d'experte</label>
                <textarea className="adm-input" name="expert_tip" rows={3}
                  value={form.expert_tip} onChange={handleChange}
                  placeholder="Conseil de style personnel affiché dans l'encadré &quot;Notre experte dit&quot;"/>
              </div>
            </div>
          )}

          {/* ── Tab 4 : Photos ── */}
          {tab === 'photos' && (
            <div className="adm-form-grid">
              <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="adm-form-label">
                  Photos du produit
                  <span className="adm-form-hint"> — glisser-déposer ou cliquer pour ajouter</span>
                </label>
                <ImageManager
                  existingImages   = {existingImages}
                  onExistingDelete = {handleExistingDelete}
                  onSetMain        = {handleSetMain}
                  newFiles         = {newFiles}
                  onNewFiles       = {handleNewFiles}
                  onRemoveNew      = {handleRemoveNew}
                  onSetNewMain     = {handleSetNewMain}
                  newMainIdx       = {newMainIdx}
                />
              </div>
            </div>
          )}

          <div className="adm-modal__foot">
            <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Annuler</button>
            <button type="submit" className="adm-btn adm-btn--gold" disabled={saving}>
              {saving ? 'Enregistrement…' : product ? 'Sauvegarder' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page Produits ─────────────────────────────────────────────────────────────
export default function ProductsAdmin() {
  const [products,        setProducts]       = useState([])
  const [categories,      setCategories]     = useState([])
  const [allSubcategories, setAllSubcats]    = useState([])
  const [search,          setSearch]         = useState('')
  const [loading,         setLoading]        = useState(true)
  const [modal,           setModal]          = useState(null)

  const load = (q = search) => {
    setLoading(true)
    adminAPI.products.list(q)
      .then(({ data }) => { setProducts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load('')
    categoriesAPI.list().then(({ data }) => setCategories(data))
    adminAPI.subcategories.list().then(({ data }) => setAllSubcats(data))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit définitivement ?')) return
    await adminAPI.products.delete(id)
    load()
  }

  const handleSaved = () => { setModal(null); load() }

  const CONDITION_MAP = { new_with_tags: 'Neuf', excellent: 'Excellent', very_good: 'Très bon', good: 'Bon' }

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
                        : <div style={{ width:36, height:44, background:'#f0f0f0', borderRadius:3 }}/>}
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{p.name}</div>
                        <div style={{ fontSize:11, color:'var(--gray-text)' }}>{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize:13 }}>{p.category?.name || '—'}</div>
                    {p.subcategory && <div style={{ fontSize:11, color:'var(--gray-text)' }}>{p.subcategory.name}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize:13 }}>{p.size}</div>
                    {p.size_tag && <div style={{ fontSize:11, color:'var(--gray-text)' }}>{p.size_tag}</div>}
                  </td>
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
                        <span key={hex} className="adm-table-color-dot"
                          style={{ background: hex, border: hex === '#FFFFFF' || hex === '#F5F5DC' ? '1px solid #ddd' : undefined }}
                          title={hex}/>
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
          product         = {modal === 'new' ? null : modal}
          categories      = {categories}
          allSubcategories = {allSubcategories}
          onClose         = {() => setModal(null)}
          onSaved         = {handleSaved}
        />
      )}
    </div>
  )
}
