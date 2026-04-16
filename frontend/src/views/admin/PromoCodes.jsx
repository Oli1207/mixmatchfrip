import { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiTag, FiCopy, FiCheck } from 'react-icons/fi'
import { adminAPI } from '../../utils/adminApi'
import './PromoCodes.css'

const EMPTY_FORM = {
  code: '',
  discount_type: 'percent',
  discount_value: '',
  minimum_amount: '',
  usage_limit: '',
  expires_at: '',
  is_active: true,
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function PromoCodes() {
  const [promos,  setPromos]  = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,    setForm]    = useState({ ...EMPTY_FORM })
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)
  const [copied,  setCopied]  = useState(null)

  const load = () => {
    setLoading(true)
    adminAPI.promos.list()
      .then(({ data }) => setPromos(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleGenerate = () => {
    setForm(p => ({ ...p, code: generateCode() }))
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.code.trim() || !form.discount_value) {
      setError('Le code et la valeur de reduction sont obligatoires.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        code:           form.code.trim().toUpperCase(),
        discount_type:  form.discount_type,
        discount_value: parseFloat(form.discount_value),
        minimum_amount: parseFloat(form.minimum_amount || 0),
        usage_limit:    form.usage_limit ? parseInt(form.usage_limit) : null,
        expires_at:     form.expires_at || null,
        is_active:      form.is_active,
      }
      await adminAPI.promos.create(payload)
      setForm({ ...EMPTY_FORM })
      setShowForm(false)
      load()
    } catch (err) {
      const msg = err?.response?.data?.code?.[0]
        || err?.response?.data?.detail
        || 'Une erreur est survenue.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (promo) => {
    try {
      await adminAPI.promos.update(promo.id, { is_active: !promo.is_active })
      setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, is_active: !p.is_active } : p))
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce code promo ?')) return
    try {
      await adminAPI.promos.delete(id)
      setPromos(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  const formatExpiry = (dt) => {
    if (!dt) return 'Jamais'
    return new Date(dt).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const activeCount = promos.filter(p => p.is_active && !p.is_expired && !p.is_maxed).length

  return (
    <div className="promo-page">
      {/* Header */}
      <div className="promo-header">
        <div>
          <h1 className="promo-header__title">Codes promo</h1>
          <p className="promo-header__sub">
            {activeCount} code{activeCount !== 1 ? 's' : ''} actif{activeCount !== 1 ? 's' : ''} sur {promos.length} au total
          </p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setShowForm(v => !v); setError(null) }}>
          <FiPlus size={15}/>
          Nouveau code
        </button>
      </div>

      {/* Formulaire creation */}
      {showForm && (
        <div className="promo-form-card">
          <h3 className="promo-form-card__title">Creer un code promo</h3>
          <form onSubmit={handleSubmit} className="promo-form">

            {/* Code */}
            <div className="promo-field promo-field--code">
              <label className="promo-label">Code *</label>
              <div className="promo-code-input">
                <input
                  className="adm-input promo-code-text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="EX: BIENVENUE10"
                  maxLength={50}
                />
                <button type="button" className="promo-gen-btn" onClick={handleGenerate}>
                  Generer
                </button>
              </div>
            </div>

            {/* Type + Valeur */}
            <div className="promo-row">
              <div className="promo-field">
                <label className="promo-label">Type de remise *</label>
                <div className="promo-type-toggle">
                  <button
                    type="button"
                    className={`promo-type-btn${form.discount_type === 'percent' ? ' active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, discount_type: 'percent' }))}
                  >
                    % Pourcentage
                  </button>
                  <button
                    type="button"
                    className={`promo-type-btn${form.discount_type === 'fixed' ? ' active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, discount_type: 'fixed' }))}
                  >
                    $ Montant fixe
                  </button>
                </div>
              </div>
              <div className="promo-field">
                <label className="promo-label">
                  Valeur * {form.discount_type === 'percent' ? '(%)' : '($)'}
                </label>
                <input
                  className="adm-input"
                  name="discount_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount_value}
                  onChange={handleChange}
                  placeholder={form.discount_type === 'percent' ? 'Ex: 15' : 'Ex: 10.00'}
                />
              </div>
            </div>

            {/* Montant min + Limite */}
            <div className="promo-row">
              <div className="promo-field">
                <label className="promo-label">Panier minimum ($)</label>
                <input
                  className="adm-input"
                  name="minimum_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minimum_amount}
                  onChange={handleChange}
                  placeholder="0 = aucun minimum"
                />
              </div>
              <div className="promo-field">
                <label className="promo-label">Limite d'utilisations</label>
                <input
                  className="adm-input"
                  name="usage_limit"
                  type="number"
                  min="1"
                  value={form.usage_limit}
                  onChange={handleChange}
                  placeholder="Laisser vide = illimite"
                />
              </div>
            </div>

            {/* Expiration + Actif */}
            <div className="promo-row">
              <div className="promo-field">
                <label className="promo-label">Date d'expiration</label>
                <input
                  className="adm-input"
                  name="expires_at"
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={handleChange}
                />
              </div>
              <div className="promo-field promo-field--check">
                <label className="promo-label">Actif immediatement</label>
                <label className="promo-toggle-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  <span className="promo-toggle-switch"/>
                  <span>{form.is_active ? 'Oui' : 'Non'}</span>
                </label>
              </div>
            </div>

            {error && <p className="promo-error">{error}</p>}

            <div className="promo-form-actions">
              <button type="button" className="adm-btn adm-btn--ghost"
                onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }); setError(null) }}>
                Annuler
              </button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
                {saving ? 'Creation...' : 'Creer le code'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="promo-loading">Chargement...</div>
      ) : promos.length === 0 ? (
        <div className="promo-empty">
          <FiTag size={40} style={{ opacity: 0.2 }}/>
          <p>Aucun code promo pour le moment.</p>
          <button className="adm-btn adm-btn--primary" onClick={() => setShowForm(true)}>
            Creer mon premier code
          </button>
        </div>
      ) : (
        <div className="promo-list">
          {promos.map(promo => {
            const expired = promo.is_expired
            const maxed   = promo.is_maxed
            const dead    = expired || maxed || !promo.is_active

            return (
              <div key={promo.id} className={`promo-card${dead ? ' promo-card--inactive' : ''}`}>
                <div className="promo-card__left">
                  <div className="promo-card__code-row">
                    <span className="promo-card__code">{promo.code}</span>
                    <button
                      className="promo-copy-btn"
                      onClick={() => handleCopy(promo.code)}
                      title="Copier"
                    >
                      {copied === promo.code ? <FiCheck size={13}/> : <FiCopy size={13}/>}
                    </button>
                  </div>

                  <div className="promo-card__badges">
                    <span className="promo-badge promo-badge--value">
                      {promo.discount_type === 'percent'
                        ? `-${promo.discount_value}%`
                        : `-${parseFloat(promo.discount_value).toFixed(2)}$`}
                    </span>
                    {parseFloat(promo.minimum_amount) > 0 && (
                      <span className="promo-badge">Min. {parseFloat(promo.minimum_amount).toFixed(2)}$</span>
                    )}
                    {expired && <span className="promo-badge promo-badge--danger">Expire</span>}
                    {maxed   && <span className="promo-badge promo-badge--danger">Limite atteinte</span>}
                  </div>

                  <div className="promo-card__meta">
                    <span>
                      Utilisations : <strong>{promo.used_count}</strong>
                      {promo.usage_limit ? ` / ${promo.usage_limit}` : ' (illimite)'}
                    </span>
                    <span>Expiration : <strong>{formatExpiry(promo.expires_at)}</strong></span>
                  </div>
                </div>

                <div className="promo-card__right">
                  <button
                    className={`promo-toggle${promo.is_active ? ' active' : ''}`}
                    onClick={() => handleToggle(promo)}
                    title={promo.is_active ? 'Desactiver' : 'Activer'}
                  >
                    {promo.is_active
                      ? <><FiToggleRight size={22}/> Actif</>
                      : <><FiToggleLeft size={22}/> Inactif</>}
                  </button>
                  <button
                    className="promo-delete-btn"
                    onClick={() => handleDelete(promo.id)}
                    title="Supprimer"
                  >
                    <FiTrash2 size={15}/>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
