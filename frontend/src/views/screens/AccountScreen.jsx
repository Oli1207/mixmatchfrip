import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { userAPI, wishlistAPI } from '../../utils/api'
import { FiUser, FiMail, FiPhone, FiLock, FiCheck, FiAlertCircle, FiShoppingBag, FiEdit2, FiHeart, FiX, FiShoppingCart } from 'react-icons/fi'
import './AccountScreen.css'

export default function AccountScreen() {
  const navigate   = useNavigate()
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const storeUser  = useAuthStore(s => s.user)

  const [profile,    setProfile]    = useState(null)
  const [loading,    setLoading]    = useState(true)

  // Wishlist
  const [wishlist,      setWishlist]      = useState([])
  const [wishlistLoad,  setWishlistLoad]  = useState(true)
  const [removingId,    setRemovingId]    = useState(null)

  // Formulaire profil
  const [profileForm,  setProfileForm]  = useState({ full_name: '', phone: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg,   setProfileMsg]   = useState(null)  // { type: 'success'|'error', text }

  // Formulaire mot de passe
  const [pwForm,      setPwForm]      = useState({ old_password: '', new_password: '', new_password2: '' })
  const [pwSaving,    setPwSaving]    = useState(false)
  const [pwMsg,       setPwMsg]       = useState(null)

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    userAPI.me()
      .then(({ data }) => {
        setProfile(data)
        setProfileForm({ full_name: data.full_name || '', phone: data.phone || '' })
        setLoading(false)
      })
      .catch(() => setLoading(false))

    wishlistAPI.list()
      .then(({ data }) => setWishlist(data))
      .catch(() => {})
      .finally(() => setWishlistLoad(false))
  }, [])

  const handleRemoveWishlist = async (productId) => {
    setRemovingId(productId)
    try {
      await wishlistAPI.toggle(productId)
      setWishlist(w => w.filter(item => item.product.id !== productId))
    } finally {
      setRemovingId(null)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(p => ({ ...p, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSaving(true); setProfileMsg(null)
    try {
      const { data } = await userAPI.update(profileForm)
      setProfile(data.user || data)
      setProfileMsg({ type: 'success', text: 'Profil mis à jour ✓' })
    } catch (err) {
      const d = err?.response?.data
      setProfileMsg({ type: 'error', text: d ? Object.values(d).flat().join(' ') : 'Erreur.' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePwChange = (e) => {
    const { name, value } = e.target
    setPwForm(p => ({ ...p, [name]: value }))
  }

  const handlePwSubmit = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.new_password2) {
      setPwMsg({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' })
      return
    }
    setPwSaving(true); setPwMsg(null)
    try {
      await userAPI.changePassword({
        old_password:  pwForm.old_password,
        new_password:  pwForm.new_password,
        new_password2: pwForm.new_password2,
      })
      setPwMsg({ type: 'success', text: 'Mot de passe mis à jour ✓' })
      setPwForm({ old_password: '', new_password: '', new_password2: '' })
    } catch (err) {
      const d = err?.response?.data
      const msg = d?.old_password?.[0] || d?.new_password?.[0] || d?.detail || Object.values(d || {}).flat().join(' ') || 'Erreur.'
      setPwMsg({ type: 'error', text: msg })
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return (
    <div className="acc-loading">
      <div className="acc-spinner"/>
    </div>
  )

  const displayName = profile?.full_name || storeUser?.full_name || 'Vous'

  return (
    <div className="acc-page">
      <div className="acc-container">

        {/* Header */}
        <div className="acc-header">
          <div className="acc-avatar">
            {displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="acc-title">Bonjour, {displayName.split(' ')[0]}</h1>
            <p className="acc-subtitle">{profile?.email || storeUser?.email}</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="acc-quicklinks">
          <Link to="/orders" className="acc-quicklink">
            <FiShoppingBag size={20}/>
            <span>Mes commandes</span>
          </Link>
          <Link to="/cart" className="acc-quicklink">
            <FiShoppingCart size={20}/>
            <span>Mon panier</span>
          </Link>
        </div>

        <div className="acc-grid">
          {/* ── Section Profil ── */}
          <section className="acc-card">
            <div className="acc-card__head">
              <FiUser size={16}/>
              <h2>Informations personnelles</h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="acc-form">
              <div className="acc-form-group">
                <label className="acc-form-label">
                  <FiUser size={13}/> Nom complet
                </label>
                <input className="acc-input" name="full_name"
                  value={profileForm.full_name}
                  onChange={handleProfileChange}
                  placeholder="Votre nom complet"/>
              </div>

              <div className="acc-form-group">
                <label className="acc-form-label">
                  <FiMail size={13}/> Adresse courriel
                </label>
                <input className="acc-input acc-input--disabled"
                  value={profile?.email || storeUser?.email || ''}
                  disabled readOnly/>
                <p className="acc-form-hint">L'adresse courriel ne peut pas être modifiée.</p>
              </div>

              <div className="acc-form-group">
                <label className="acc-form-label">
                  <FiPhone size={13}/> Téléphone
                </label>
                <input className="acc-input" name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="+1 (514) 000-0000"/>
              </div>

              {profileMsg && (
                <div className={`acc-msg acc-msg--${profileMsg.type}`}>
                  {profileMsg.type === 'success' ? <FiCheck size={14}/> : <FiAlertCircle size={14}/>}
                  {profileMsg.text}
                </div>
              )}

              <button type="submit" className="acc-btn" disabled={profileSaving}>
                <FiEdit2 size={14}/>
                {profileSaving ? 'Enregistrement…' : 'Mettre à jour'}
              </button>
            </form>
          </section>

          {/* ── Section Mot de passe ── */}
          <section className="acc-card">
            <div className="acc-card__head">
              <FiLock size={16}/>
              <h2>Changer le mot de passe</h2>
            </div>
            <form onSubmit={handlePwSubmit} className="acc-form">
              <div className="acc-form-group">
                <label className="acc-form-label">Mot de passe actuel</label>
                <input className="acc-input" type="password" name="old_password"
                  value={pwForm.old_password} onChange={handlePwChange} required/>
              </div>
              <div className="acc-form-group">
                <label className="acc-form-label">Nouveau mot de passe</label>
                <input className="acc-input" type="password" name="new_password"
                  value={pwForm.new_password} onChange={handlePwChange} required
                  placeholder="8 caractères minimum"/>
              </div>
              <div className="acc-form-group">
                <label className="acc-form-label">Confirmer le nouveau mot de passe</label>
                <input className="acc-input" type="password" name="new_password2"
                  value={pwForm.new_password2} onChange={handlePwChange} required/>
              </div>

              {pwMsg && (
                <div className={`acc-msg acc-msg--${pwMsg.type}`}>
                  {pwMsg.type === 'success' ? <FiCheck size={14}/> : <FiAlertCircle size={14}/>}
                  {pwMsg.text}
                </div>
              )}

              <button type="submit" className="acc-btn" disabled={pwSaving}>
                <FiLock size={14}/>
                {pwSaving ? 'Enregistrement…' : 'Changer le mot de passe'}
              </button>
            </form>
          </section>
        </div>

        {/* ── Section Wishlist ── */}
        <section className="acc-card acc-card--full" style={{ marginTop: 24 }}>
          <div className="acc-card__head">
            <FiHeart size={16}/>
            <h2>Mes favoris</h2>
            {wishlist.length > 0 && (
              <span className="acc-wishlist-count">{wishlist.length}</span>
            )}
          </div>

          {wishlistLoad ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0' }}>
              <div className="acc-spinner"/>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="acc-empty">
              <FiHeart size={32} style={{ opacity: 0.25, marginBottom: 12 }}/>
              <p>Vous n'avez pas encore de favoris.</p>
              <Link to="/catalogue" className="acc-btn" style={{ display: 'inline-flex', marginTop: 8 }}>
                Parcourir la boutique
              </Link>
            </div>
          ) : (
            <div className="acc-wishlist-grid">
              {wishlist.map(({ product }) => (
                  <div key={product.id} className="acc-wish-card">
                    <button
                      className="acc-wish-card__remove"
                      onClick={() => handleRemoveWishlist(product.id)}
                      disabled={removingId === product.id}
                      title="Retirer des favoris"
                    >
                      <FiX size={12}/>
                    </button>
                    <Link to={`/product/${product.slug}`} className="acc-wish-card__img-wrap">
                      {product.main_image_url ? (
                        <img src={product.main_image_url} alt={product.name}/>
                      ) : (
                        <div className="acc-wish-card__no-img"/>
                      )}
                    </Link>
                    <div className="acc-wish-card__info">
                      {product.brand && (
                        <span className="acc-wish-card__brand">{product.brand}</span>
                      )}
                      <Link to={`/product/${product.slug}`} className="acc-wish-card__name">
                        {product.name}
                      </Link>
                      <div className="acc-wish-card__price">
                        {parseFloat(product.price).toFixed(2)} $
                        {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                          <span className="acc-wish-card__original">
                            {parseFloat(product.original_price).toFixed(2)} $
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
