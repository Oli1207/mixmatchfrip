import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiChevronRight, FiHeart, FiShare2, FiShield, FiTruck, FiRefreshCw, FiCheck, FiStar } from 'react-icons/fi'
import { productsAPI, wishlistAPI } from '../../utils/api'
import useCartStore from '../../store/cart'
import useAuthStore from '../../store/auth'
import { formatPrice } from '../../utils/currency'
import './ProductDetailScreen.css'

const CONDITION_META = {
  new_with_tags: { label: 'Neuf avec etiquette', color: '#1a7a4a', bg: '#e8f5ee', desc: 'Jamais porte, etiquette d\'origine presente.' },
  excellent:     { label: 'Excellent etat',       color: '#1a7a4a', bg: '#e8f5ee', desc: 'Comme neuf, aucun defaut visible.' },
  very_good:     { label: 'Tres bon etat',        color: '#2563eb', bg: '#eff6ff', desc: 'Legeres traces d\'usage, tres bon etat general.' },
  good:          { label: 'Bon etat',             color: '#b45309', bg: '#fffbeb', desc: 'Signes normaux de port, bon etat general.' },
}

// Parse mix_match_tips : chaque ligne commencant par "-" devient un item
function parseMixMatchTips(text) {
  if (!text) return []
  return text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(l => l.replace(/^[-*]\s*/, ''))
}

export default function ProductDetailScreen() {
  const { slug }       = useParams()
  const navigate       = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const { addItem }    = useCartStore()

  const [product,     setProduct]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [activeImg,   setActiveImg]   = useState(0)
  const [wishlisted,  setWishlisted]  = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [activeTab,   setActiveTab]   = useState('description')

  useEffect(() => {
    setLoading(true)
    setError(null)
    setActiveImg(0)
    setActiveTab('description')
    productsAPI.detail(slug)
      .then(({ data }) => { setProduct(data); setLoading(false) })
      .catch(() => { setError('Produit introuvable.'); setLoading(false) })
  }, [slug])

  const handleAddToCart = async () => {
    if (cartLoading) return
    setCartLoading(true)
    const result = await addItem(product.id)
    setCartLoading(false)
    if (result.success) {
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2500)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate('/cart')
  }

  const handleWishlistToggle = async () => {
    if (!isLoggedIn()) { navigate('/login'); return }
    setWishlisted(v => !v)
    try {
      await wishlistAPI.toggle(product.id)
    } catch {
      setWishlisted(v => !v)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pdp">
        <div className="pdp-main pdp-main--loading">
          <div className="pdp-skeleton pdp-skeleton--gallery" />
          <div className="pdp-skeleton--info">
            <div className="pdp-skeleton pdp-skeleton--line" style={{width:'40%', height:14}} />
            <div className="pdp-skeleton pdp-skeleton--line" style={{width:'70%', height:28, marginTop:10}} />
            <div className="pdp-skeleton pdp-skeleton--line" style={{width:'30%', height:20, marginTop:16}} />
            <div className="pdp-skeleton pdp-skeleton--line" style={{width:'100%', height:80, marginTop:24}} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="pdp">
        <div className="pdp-error">
          <h2>Produit introuvable</h2>
          <Link to="/catalogue" className="btn-gold">Retour a la boutique</Link>
        </div>
      </div>
    )
  }

  const images    = product.images || []
  const mainImg   = images[activeImg]?.image || null
  const condInfo  = CONDITION_META[product.condition] || CONDITION_META.good
  const related   = product.related || []
  const bullets   = [product.bullet_1, product.bullet_2, product.bullet_3, product.bullet_4].filter(Boolean)
  const mixTips   = parseMixMatchTips(product.mix_match_tips)

  const measures = [
    { label: 'Epaule a epaule',     value: product.measure_shoulder },
    { label: 'Aisselle a aisselle', value: product.measure_chest },
    { label: 'Taille',              value: product.measure_waist },
    { label: 'Hanches',             value: product.measure_hips },
    { label: 'Longueur totale',     value: product.measure_length },
    { label: 'Longueur des manches',value: product.measure_sleeve },
  ].filter(m => m.value != null)

  return (
    <div className="pdp">

      {/* Breadcrumb */}
      <div className="pdp-breadcrumb">
        <div className="pdp-breadcrumb__inner">
          <Link to="/">Accueil</Link>
          <FiChevronRight size={12}/>
          <Link to="/catalogue">Boutique</Link>
          <FiChevronRight size={12}/>
          {product.category && (
            <>
              <Link to={`/catalogue?category=${product.category.slug}`}>{product.category.name}</Link>
              <FiChevronRight size={12}/>
            </>
          )}
          {product.subcategory && (
            <>
              <Link to={`/catalogue?subcategory=${product.subcategory.slug}`}>{product.subcategory.name}</Link>
              <FiChevronRight size={12}/>
            </>
          )}
          <span>{product.name}</span>
        </div>
      </div>

      {/* Main */}
      <div className="pdp-main">

        {/* ── Gallery ── */}
        <div className="pdp-gallery">
          <div className="pdp-gallery__thumbs">
            {images.map((img, i) => (
              <button key={img.id} className={`pdp-thumb${activeImg === i ? ' active' : ''}`}
                onClick={() => setActiveImg(i)}>
                <img src={img.image} alt={`${product.name} ${i + 1}`}/>
              </button>
            ))}
          </div>
          <div className="pdp-gallery__main">
            {mainImg
              ? <img src={mainImg} alt={product.name} className="pdp-gallery__img"/>
              : <div className="pdp-gallery__placeholder">Pas d'image</div>
            }
            {product.discount_percent > 0 && (
              <span className="pdp-gallery__badge">-{product.discount_percent}%</span>
            )}
            <button className={`pdp-wishlist${wishlisted ? ' active' : ''}`}
              onClick={handleWishlistToggle} aria-label="Favori">
              <FiHeart size={18} fill={wishlisted ? 'currentColor' : 'none'}/>
            </button>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="pdp-info">

          {/* Marque + Titre */}
          <p className="pdp-brand">{product.brand}</p>
          <h1 className="pdp-name">{product.name}</h1>

          {/* Etat */}
          <span className="pdp-condition" style={{ background: condInfo.bg, color: condInfo.color }}>
            ● {condInfo.label}
          </span>

          {/* Prix */}
          <div className="pdp-prices">
            <span className="pdp-price">{formatPrice(product.price)}</span>
            {product.original_price && <span className="pdp-original">{formatPrice(product.original_price)}</span>}
            {product.discount_percent > 0 && (
              <span className="pdp-discount">-{product.discount_percent}%</span>
            )}
          </div>

          {/* Bullets — arguments de vente */}
          {bullets.length > 0 && (
            <ul className="pdp-bullets">
              {bullets.map((b, i) => (
                <li key={i} className="pdp-bullet">
                  <FiCheck size={14} className="pdp-bullet__icon"/>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Meta rapide : taille + couleurs */}
          <div className="pdp-meta">
            <div className="pdp-meta__item">
              <span className="pdp-meta__label">Taille indiquee</span>
              <span className="pdp-meta__val pdp-size">{product.size_tag || product.size}</span>
            </div>
            {product.size_recommendation && (
              <div className="pdp-meta__item">
                <span className="pdp-meta__label">Recommandee</span>
                <span className="pdp-meta__val" style={{fontSize:12}}>{product.size_recommendation}</span>
              </div>
            )}
            {Array.isArray(product.color) && product.color.length > 0 && (
              <div className="pdp-meta__item">
                <span className="pdp-meta__label">Couleur{product.color.length > 1 ? 's' : ''}</span>
                <div className="pdp-colors">
                  {product.color.map(hex => (
                    <span key={hex} className="pdp-color-dot"
                      style={{ background: hex, border: ['#FFFFFF','#F5F5DC','#E8D5B7','#FFF'].includes(hex) ? '1.5px solid #ccc' : undefined }}
                      title={hex}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stock warning */}
          {product.stock <= 3 && product.stock > 0 && (
            <p className="pdp-stock-warn">Plus que {product.stock} disponible !</p>
          )}

          {/* CTA */}
          <div className="pdp-cta">
            <button
              className={`pdp-add-btn${addedToCart ? ' added' : ''}`}
              onClick={handleAddToCart}
              disabled={cartLoading || !product.is_available}
            >
              {!product.is_available ? 'Épuisé'
                : cartLoading ? 'Ajout...'
                : addedToCart
                  ? <><FiCheck size={14} style={{ marginRight: 4 }}/>Ajouté au panier</>
                  : 'Ajouter au panier'}
            </button>
            <button className={`pdp-wish-btn${wishlisted ? ' active' : ''}`} onClick={handleWishlistToggle}>
              <FiHeart size={18} fill={wishlisted ? 'currentColor' : 'none'}/>
            </button>
          </div>

          <button className="pdp-buy-btn" onClick={handleBuyNow} disabled={!product.is_available}>
            Acheter maintenant
          </button>

          {/* Garanties */}
          <div className="pdp-perks">
            <div className="pdp-perk"><FiCheck size={14}/> Piece lavee et prete a porter</div>
            <div className="pdp-perk"><FiTruck size={14}/> Expedie sous 24-48h via Postes Canada</div>
            <div className="pdp-perk"><FiRefreshCw size={14}/> Retours sous 48h si non conforme</div>
            <div className="pdp-perk"><FiShield size={14}/> Paiement 100% securise via Stripe</div>
          </div>

          <button className="pdp-share"
            onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}>
            <FiShare2 size={14}/> Partager cet article
          </button>
        </div>
      </div>

      {/* ── Onglets Description ── */}
      <div className="pdp-tabs-section">
        <div className="pdp-tabs-inner">

          <div className="pdp-tabs">
            {[
              { key: 'description', label: 'Description' },
              { key: 'identity',    label: 'Carte d\'identite' },
              ...(mixTips.length ? [{ key: 'mixmatch', label: 'Mix & Match' }] : []),
              ...(product.expert_tip ? [{ key: 'expert', label: 'Conseil Expert' }] : []),
            ].map(tab => (
              <button key={tab.key}
                className={`pdp-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pdp-tab-content">

            {/* Description */}
            {activeTab === 'description' && (
              <div className="pdp-tab-pane">
                {product.description
                  ? <p className="pdp-desc-text">{product.description}</p>
                  : <p className="pdp-desc-empty">Aucune description disponible.</p>
                }
              </div>
            )}

            {/* Carte d'identite */}
            {activeTab === 'identity' && (
              <div className="pdp-tab-pane">
                <div className="pdp-identity">

                  {/* Infos generales */}
                  <div className="pdp-identity__section">
                    <h4 className="pdp-identity__subtitle">Informations generales</h4>
                    <div className="pdp-identity__grid">
                      {product.brand && (
                        <div className="pdp-id-row">
                          <span className="pdp-id-label">Marque</span>
                          <span className="pdp-id-val">{product.brand}</span>
                        </div>
                      )}
                      <div className="pdp-id-row">
                        <span className="pdp-id-label">Etat</span>
                        <span className="pdp-id-val" style={{ color: condInfo.color, fontWeight: 600 }}>
                          {condInfo.label}
                        </span>
                      </div>
                      <div className="pdp-id-row">
                        <span className="pdp-id-label">Taille indiquee</span>
                        <span className="pdp-id-val">{product.size_tag || product.size}</span>
                      </div>
                      {product.size_recommendation && (
                        <div className="pdp-id-row">
                          <span className="pdp-id-label">Taille recommandee</span>
                          <span className="pdp-id-val">{product.size_recommendation}</span>
                        </div>
                      )}
                      {product.material && (
                        <div className="pdp-id-row pdp-id-row--full">
                          <span className="pdp-id-label">Matiere</span>
                          <span className="pdp-id-val">{product.material}</span>
                        </div>
                      )}
                      {product.details && (
                        <div className="pdp-id-row pdp-id-row--full">
                          <span className="pdp-id-label">Details</span>
                          <span className="pdp-id-val">{product.details}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mesures */}
                  {measures.length > 0 && (
                    <div className="pdp-identity__section">
                      <h4 className="pdp-identity__subtitle">Mesures a plat</h4>
                      <p className="pdp-identity__hint">Toutes les mesures sont en centimetres, prises a plat.</p>
                      <div className="pdp-measures">
                        {measures.map(m => (
                          <div key={m.label} className="pdp-measure-row">
                            <span className="pdp-measure-label">{m.label}</span>
                            <span className="pdp-measure-val">{m.value} cm</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Mix & Match */}
            {activeTab === 'mixmatch' && (
              <div className="pdp-tab-pane">
                <div className="pdp-mixmatch">
                  <p className="pdp-mixmatch__intro">
                    Quelques idees pour porter cette piece avec style :
                  </p>
                  <div className="pdp-mixmatch__list">
                    {mixTips.map((tip, i) => (
                      <div key={i} className="pdp-mix-item">
                        <span className="pdp-mix-num">{i + 1}</span>
                        <span className="pdp-mix-text">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conseil expert */}
            {activeTab === 'expert' && product.expert_tip && (
              <div className="pdp-tab-pane">
                <div className="pdp-expert">
                  <div className="pdp-expert__avatar"><FiStar size={20}/></div>
                  <div className="pdp-expert__body">
                    <p className="pdp-expert__label">Conseil de notre styliste</p>
                    <p className="pdp-expert__text">{product.expert_tip}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="pdp-related">
          <div className="pdp-related__inner">
            <h2 className="pdp-related__title">Vous aimerez aussi</h2>
            <div className="pdp-related__grid">
              {related.map(p => (
                <Link key={p.id} to={`/product/${p.slug}`} className="pdp-rel-card">
                  <div className="pdp-rel-card__img-wrap">
                    {p.main_image_url
                      ? <img src={p.main_image_url} alt={p.name} className="pdp-rel-card__img"/>
                      : <div className="pdp-gallery__placeholder" />
                    }
                    {p.discount_percent > 0 && (
                      <span className="pdp-rel-card__badge">-{p.discount_percent}%</span>
                    )}
                  </div>
                  <div className="pdp-rel-card__info">
                    <span className="pdp-rel-card__brand">{p.brand}</span>
                    <p className="pdp-rel-card__name">{p.name}</p>
                    <span className="pdp-rel-card__price">{formatPrice(p.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
