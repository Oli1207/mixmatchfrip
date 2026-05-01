import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiChevronRight, FiHeart, FiShare2, FiShield, FiTruck, FiRefreshCw, FiCheck, FiStar, FiCamera, FiMaximize2 } from 'react-icons/fi'
import { productsAPI, wishlistAPI } from '../../utils/api'
import useCartStore from '../../store/cart'
import useAuthStore from '../../store/auth'
import { formatPrice } from '../../utils/currency'
import { loc } from '../../utils/loc'
import './ProductDetailScreen.css'
import SEOHead, { schemaProduct, schemaBreadcrumb } from '../../components/SEOHead'
import { events as analyticsEvents } from '../../analytics/analytics'

const CONDITION_COLORS = {
  new_with_tags: { color: '#1a7a4a', bg: '#e8f5ee' },
  excellent:     { color: '#1a7a4a', bg: '#e8f5ee' },
  very_good:     { color: '#2563eb', bg: '#eff6ff' },
  good:          { color: '#b45309', bg: '#fffbeb' },
}

function parseMixMatchTips(text) {
  if (!text) return []
  return text.split('\n').map(l => l.trim()).filter(l => l.length > 0).map(l => l.replace(/^[-*]\s*/, ''))
}

export default function ProductDetailScreen() {
  const { t, i18n }    = useTranslation()
  const lng            = i18n.language
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

  const CONDITION_LABELS = {
    new_with_tags: t('catalogue.condition_new_tags'),
    excellent:     t('catalogue.condition_excellent'),
    very_good:     t('catalogue.condition_very_good'),
    good:          t('catalogue.condition_good'),
  }

  useEffect(() => {
    setLoading(true); setError(null); setActiveImg(0); setActiveTab('description')
    productsAPI.detail(slug)
      .then(({ data }) => { setProduct(data); setLoading(false); analyticsEvents.viewProduct(data) })
      .catch(() => { setError(t('product.not_found_title')); setLoading(false) })
  }, [slug])

  const handleAddToCart = async () => {
    if (cartLoading) return
    setCartLoading(true)
    const result = await addItem(product.id, 1, product)
    setCartLoading(false)
    if (result.success) { setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2500) }
  }

  const handleBuyNow = async () => { await handleAddToCart(); navigate('/cart') }

  const handleWishlistToggle = async () => {
    if (!isLoggedIn()) { navigate('/login'); return }
    setWishlisted(v => !v)
    try { await wishlistAPI.toggle(product.id) }
    catch { setWishlisted(v => !v) }
  }

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
          <h2>{t('product.not_found_title')}</h2>
          <Link to="/catalogue" className="btn-gold">{t('product.back_to_shop')}</Link>
        </div>
      </div>
    )
  }

  const images      = product.images || []
  const mainImg     = images[activeImg]?.image || null
  const condColors  = CONDITION_COLORS[product.condition] || CONDITION_COLORS.good
  const condLabel   = CONDITION_LABELS[product.condition] || product.condition
  const related     = product.related || []

  // Localized content fields
  const productName    = loc(product, 'name',           lng)
  const productDesc    = loc(product, 'description',    lng)
  const productMat     = loc(product, 'material',       lng)
  const productDetails = loc(product, 'details',        lng)
  const productSizeRec = loc(product, 'size_recommendation', lng)
  const productExpert  = loc(product, 'expert_tip',     lng)
  const productMix     = loc(product, 'mix_match_tips', lng)

  const bullets = [
    loc(product, 'bullet_1', lng),
    loc(product, 'bullet_2', lng),
    loc(product, 'bullet_3', lng),
    loc(product, 'bullet_4', lng),
  ].filter(Boolean)

  const mixTips = parseMixMatchTips(productMix)

  // Category/Subcategory localized names
  const catName  = loc(product.category,    'name', lng) || product.category?.name
  const subName  = loc(product.subcategory, 'name', lng) || product.subcategory?.name

  const measures = [
    { label: t('product.measures_shoulder'), value: product.measure_shoulder },
    { label: t('product.measures_chest'),    value: product.measure_chest },
    { label: t('product.measures_waist'),    value: product.measure_waist },
    { label: t('product.measures_hips'),     value: product.measure_hips },
    { label: t('product.measures_length'),   value: product.measure_length },
    { label: t('product.measures_sleeve'),   value: product.measure_sleeve },
  ].filter(m => m.value != null)

  const mainImageUrl = images[0]?.image || null
  const productSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      schemaProduct(product, mainImageUrl),
      schemaBreadcrumb([
        { name: t('product.breadcrumb_home'), url: '/' },
        { name: t('product.breadcrumb_catalogue'), url: '/catalogue' },
        { name: catName || '', url: `/catalogue?category=${product.category?.slug}` },
        { name: productName },
      ]),
    ],
  }

  return (
    <div className="pdp">
      <SEOHead
        title={`${product.brand ? `${product.brand} — ` : ''}${productName}`}
        description={productDesc || `${productName}. ${product.price} $ CAD`}
        image={mainImageUrl || undefined}
        url={`/product/${product.slug}`}
        type="og:product"
        schema={productSchema}
      />

      {/* Breadcrumb */}
      <div className="pdp-breadcrumb">
        <div className="pdp-breadcrumb__inner">
          <Link to="/">{t('product.breadcrumb_home')}</Link>
          <FiChevronRight size={12}/>
          <Link to="/catalogue">{t('product.breadcrumb_shop')}</Link>
          <FiChevronRight size={12}/>
          {product.category && (
            <><Link to={`/catalogue?category=${product.category.slug}`}>{catName}</Link><FiChevronRight size={12}/></>
          )}
          {product.subcategory && (
            <><Link to={`/catalogue?subcategory=${product.subcategory.slug}`}>{subName}</Link><FiChevronRight size={12}/></>
          )}
          <span>{productName}</span>
        </div>
      </div>

      {/* Main */}
      <div className="pdp-main">
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-gallery__thumbs">
            {images.map((img, i) => (
              <button key={img.id} className={`pdp-thumb${activeImg === i ? ' active' : ''}`} onClick={() => setActiveImg(i)}>
                <img src={img.image} alt={`${productName} ${i + 1}`}/>
              </button>
            ))}
          </div>
          <div className="pdp-gallery__main">
            {mainImg
              ? <img src={mainImg} alt={productName} className="pdp-gallery__img"/>
              : <div className="pdp-gallery__placeholder">{t('product.no_image')}</div>
            }
            {product.discount_percent > 0 && <span className="pdp-gallery__badge">-{product.discount_percent}%</span>}
            <button className={`pdp-wishlist${wishlisted ? ' active' : ''}`} onClick={handleWishlistToggle} aria-label={t('product.wishlist_add')}>
              <FiHeart size={18} fill={wishlisted ? 'currentColor' : 'none'}/>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pdp-info">
          <p className="pdp-brand">{product.brand}</p>
          <h1 className="pdp-name">{productName}</h1>

          <span className="pdp-condition" style={{ background: condColors.bg, color: condColors.color }}>
            ● {condLabel}
          </span>

          <div className="pdp-prices">
            <span className="pdp-price">{formatPrice(product.price)}</span>
            {product.original_price && <span className="pdp-original">{formatPrice(product.original_price)}</span>}
            {product.discount_percent > 0 && <span className="pdp-discount">-{product.discount_percent}%</span>}
          </div>

          {bullets.length > 0 && (
            <ul className="pdp-bullets">
              {bullets.map((b, i) => (
                <li key={i} className="pdp-bullet"><FiCheck size={14} className="pdp-bullet__icon"/><span>{b}</span></li>
              ))}
            </ul>
          )}

          <div className="pdp-meta">
            <div className="pdp-meta__item">
              <span className="pdp-meta__label">{t('product.size_indicated')}</span>
              <span className="pdp-meta__val pdp-size">{product.size_tag || product.size}</span>
            </div>
            {productSizeRec && (
              <div className="pdp-meta__item">
                <span className="pdp-meta__label">{t('product.size_recommended')}</span>
                <span className="pdp-meta__val" style={{fontSize:12}}>{productSizeRec}</span>
              </div>
            )}
            {Array.isArray(product.color) && product.color.length > 0 && (
              <div className="pdp-meta__item">
                <span className="pdp-meta__label">{product.color.length > 1 ? t('product.colors') : t('product.color')}</span>
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

          {product.stock <= 3 && product.stock > 0 && (
            <p className="pdp-stock-warn">{t('product.stock_warning', { count: product.stock })}</p>
          )}

          <div className="pdp-cta">
            <button className={`pdp-add-btn${addedToCart ? ' added' : ''}`} onClick={handleAddToCart}
              disabled={cartLoading || !product.is_available}>
              {!product.is_available ? t('product.out_of_stock')
                : cartLoading ? t('product.adding')
                : addedToCart
                  ? <><FiCheck size={14} style={{ marginRight: 4 }}/>{t('product.added_to_cart')}</>
                  : t('product.add_to_cart')}
            </button>
            <button className={`pdp-wish-btn${wishlisted ? ' active' : ''}`} onClick={handleWishlistToggle}>
              <FiHeart size={18} fill={wishlisted ? 'currentColor' : 'none'}/>
            </button>
          </div>

          <button className="pdp-buy-btn" onClick={handleBuyNow} disabled={!product.is_available}>
            {t('product.buy_now')}
          </button>

          <div className="pdp-perks">
            <div className="pdp-perk"><FiCheck size={14}/> {t('product.perk_cleaned')}</div>
            <div className="pdp-perk"><FiCamera size={14}/> {t('product.perk_photos')}</div>
            <div className="pdp-perk"><FiMaximize2 size={14}/> {t('product.perk_measures_guide')}</div>
            <div className="pdp-perk"><FiTruck size={14}/> {t('product.perk_shipping_note')}</div>
            <div className="pdp-perk"><FiRefreshCw size={14}/> {t('product.perk_returns_note')}</div>
            <div className="pdp-perk"><FiShield size={14}/> {t('product.perk_payment_note')}</div>
          </div>

          <button className="pdp-share" onClick={() => navigator.share?.({ title: productName, url: window.location.href })}>
            <FiShare2 size={14}/> {t('product.share_item')}
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="pdp-tabs-section">
        <div className="pdp-tabs-inner">
          <div className="pdp-tabs">
            {[
              { key: 'description', label: t('product.tab_description') },
              { key: 'identity',    label: t('product.tab_identity') },
              ...(mixTips.length ? [{ key: 'mixmatch', label: t('product.tab_mix') }] : []),
              ...(productExpert   ? [{ key: 'expert',  label: t('product.tab_expert') }] : []),
            ].map(tab => (
              <button key={tab.key} className={`pdp-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
            ))}
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'description' && (
              <div className="pdp-tab-pane">
                {productDesc
                  ? <p className="pdp-desc-text">{productDesc}</p>
                  : <p className="pdp-desc-empty">{t('product.no_description')}</p>
                }
              </div>
            )}

            {activeTab === 'identity' && (
              <div className="pdp-tab-pane">
                <div className="pdp-identity">
                  <div className="pdp-identity__section">
                    <h4 className="pdp-identity__subtitle">{t('product.general_info')}</h4>
                    <div className="pdp-identity__grid">
                      {product.brand && (
                        <div className="pdp-id-row">
                          <span className="pdp-id-label">{t('product.brand_label')}</span>
                          <span className="pdp-id-val">{product.brand}</span>
                        </div>
                      )}
                      <div className="pdp-id-row">
                        <span className="pdp-id-label">{t('product.condition_label')}</span>
                        <span className="pdp-id-val" style={{ color: condColors.color, fontWeight: 600 }}>{condLabel}</span>
                      </div>
                      <div className="pdp-id-row">
                        <span className="pdp-id-label">{t('product.size_indicated')}</span>
                        <span className="pdp-id-val">{product.size_tag || product.size}</span>
                      </div>
                      {productSizeRec && (
                        <div className="pdp-id-row">
                          <span className="pdp-id-label">{t('product.size_recommended')}</span>
                          <span className="pdp-id-val">{productSizeRec}</span>
                        </div>
                      )}
                      {productMat && (
                        <div className="pdp-id-row pdp-id-row--full">
                          <span className="pdp-id-label">{t('product.material_label')}</span>
                          <span className="pdp-id-val">{productMat}</span>
                        </div>
                      )}
                      {productDetails && (
                        <div className="pdp-id-row pdp-id-row--full">
                          <span className="pdp-id-label">{t('product.details_label')}</span>
                          <span className="pdp-id-val">{productDetails}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {measures.length > 0 && (
                    <div className="pdp-identity__section">
                      <h4 className="pdp-identity__subtitle">{t('product.flat_measures')}</h4>
                      <p className="pdp-identity__hint">{t('product.measures_hint')}</p>
                      <div className="pdp-measures">
                        {measures.map(m => (
                          <div key={m.label} className="pdp-measure-row">
                            <span className="pdp-measure-label">{m.label}</span>
                            <span className="pdp-measure-val">{m.value} {t('product.measures_cm')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'mixmatch' && (
              <div className="pdp-tab-pane">
                <div className="pdp-mixmatch">
                  <p className="pdp-mixmatch__intro">{t('product.mixmatch_intro')}</p>
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

            {activeTab === 'expert' && productExpert && (
              <div className="pdp-tab-pane">
                <div className="pdp-expert">
                  <div className="pdp-expert__avatar"><FiStar size={20}/></div>
                  <div className="pdp-expert__body">
                    <p className="pdp-expert__label">{t('product.expert_label')}</p>
                    <p className="pdp-expert__text">{productExpert}</p>
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
            <h2 className="pdp-related__title">{t('product.related_title')}</h2>
            <div className="pdp-related__grid">
              {related.map(p => {
                const relName = loc(p, 'name', lng)
                return (
                  <Link key={p.id} to={`/product/${p.slug}`} className="pdp-rel-card">
                    <div className="pdp-rel-card__img-wrap">
                      {p.main_image_url
                        ? <img src={p.main_image_url} alt={relName} className="pdp-rel-card__img"/>
                        : <div className="pdp-gallery__placeholder" />
                      }
                      {p.discount_percent > 0 && <span className="pdp-rel-card__badge">-{p.discount_percent}%</span>}
                    </div>
                    <div className="pdp-rel-card__info">
                      <span className="pdp-rel-card__brand">{p.brand}</span>
                      <p className="pdp-rel-card__name">{relName}</p>
                      <span className="pdp-rel-card__price">{formatPrice(p.price)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
