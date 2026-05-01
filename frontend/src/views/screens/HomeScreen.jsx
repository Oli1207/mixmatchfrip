import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productsAPI, categoriesAPI } from '../../utils/api'
import {
  FiArrowRight, FiChevronRight,
  FiTag, FiShoppingBag, FiZap, FiHeart, FiUser, FiStar,
  FiCompass, FiCircle, FiBox, FiPackage, FiMenu,
  FiFeather, FiCheckCircle, FiTruck, FiRefreshCw,
} from 'react-icons/fi'
import { SiInstagram } from 'react-icons/si'
import { formatPrice } from '../../utils/currency'
import { loc } from '../../utils/loc'

import heroImg        from '../../assets/hero.jpg'
import herooImg       from '../../assets/heroo.jpg'
import bannerImg      from '../../assets/banner.jpg'
import aboutImg       from '../../assets/about.jpg'
import insta1         from '../../assets/insta-1.jpg'
import insta2         from '../../assets/insta-2.jpg'
import insta3         from '../../assets/insta-3.jpg'
import insta4         from '../../assets/insta-4.jpg'
import insta5         from '../../assets/insta-5.jpg'
import insta6         from '../../assets/insta-6.jpg'

import './HomeScreen.css'
import SEOHead, { schemaOrganization, schemaWebSite } from '../../components/SEOHead'

const CAT_ICONS = {
  hauts: FiShoppingBag, pantalons: FiMenu, vestes: FiZap, robes: FiHeart,
  accessoires: FiTag, femme: FiUser, homme: FiUser, enfant: FiStar,
  chaussures: FiCompass, jupes: FiCircle, manteaux: FiPackage, shorts: FiBox,
}

const INSTA_IMGS = [insta1, insta2, insta3, insta4, insta5, insta6]

function ProductCard({ product }) {
  const { t, i18n } = useTranslation()
  const lng      = i18n.language
  const [hovered, setHovered] = useState(false)
  const imgUrl   = product.main_image_url || 'https://via.placeholder.com/400x500?text=Photo'
  const discount = product.discount_percent
  const name     = loc(product, 'name', lng)

  const CONDITION_LABELS = {
    new_with_tags: t('catalogue.condition_new_tags'),
    excellent:     t('catalogue.condition_excellent'),
    very_good:     t('catalogue.condition_very_good'),
    good:          t('catalogue.condition_good'),
  }

  return (
    <div className={`hs-card${hovered ? ' hs-card--hovered' : ''}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="hs-card__img-wrap">
        <img src={imgUrl} alt={name} className="hs-card__img" loading="lazy"/>
        {discount > 0 && <span className="hs-card__badge hs-card__badge--off">-{discount}%</span>}
        <div className={`hs-card__overlay${hovered ? ' visible' : ''}`}>
          <Link to={`/product/${product.slug}`} className="hs-card__cta">{t('home.card_view')}</Link>
        </div>
      </div>
      <div className="hs-card__info">
        <span className="hs-card__brand">{product.brand}</span>
        <h3 className="hs-card__name">{name}</h3>
        <div className="hs-card__meta">
          <span className="hs-card__tag">{t('common.size')} {product.size}</span>
          <span className="hs-card__tag">{CONDITION_LABELS[product.condition] || product.condition}</span>
        </div>
        <div className="hs-card__prices">
          <span className="hs-card__price">{formatPrice(product.price)}</span>
          {product.original_price && <span className="hs-card__original">{formatPrice(product.original_price)}</span>}
        </div>
      </div>
    </div>
  )
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation()
  const lng = i18n.language
  const [email,      setEmail]      = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])

  const PERKS = [
    { Icon: FiFeather,     title: t('home.perk1_title'), desc: t('home.perk1_desc') },
    { Icon: FiCheckCircle, title: t('home.perk2_title'), desc: t('home.perk2_desc') },
    { Icon: FiTruck,       title: t('home.perk3_title'), desc: t('home.perk3_desc') },
    { Icon: FiRefreshCw,   title: t('home.perk4_title'), desc: t('home.perk4_desc') },
  ]

  useEffect(() => {
    productsAPI.list({ sort: 'recent' })
      .then(({ data }) => setProducts(data.slice(0, 8)))
      .catch(() => {})
    categoriesAPI.list()
      .then(({ data }) => setCategories(data))
      .catch(() => {})
  }, [])

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
  }

  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [schemaOrganization, schemaWebSite],
  }

  return (
    <div className="hs">
      <SEOHead url="/" description={t('home.hero_sub')} schema={homeSchema} />

      {/* ══ HERO ══ */}
      <section className="hs-hero">
        <div className="hs-hero__inner">
          <div className="hs-hero__left">
            <p className="hs-hero__eyebrow">{t('home.eyebrow')}</p>
            <h1 className="hs-hero__title">
              {t('home.hero_title').split('\n')[0]}<br />
              {t('home.hero_title').split('\n')[1]} <em>{''}</em>
              <span className="hs-hero__heart">♡</span>
            </h1>
            <p className="hs-hero__sub">
              {t('home.hero_sub').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
            <div className="hs-hero__actions">
              <Link to="/catalogue" className="btn-gold">
                {t('home.cta_shop')} <FiArrowRight size={15} style={{ marginLeft: 6 }}/>
              </Link>
              <Link to="/nouveautes" className="btn-dark-outline">{t('home.cta_new')}</Link>
            </div>
            <div className="hs-hero__pills">
              <span className="hs-hero__pill"><FiTag size={13}/> {t('home.pill_unique')}</span>
              <span className="hs-hero__pill"><FiFeather size={13}/> {t('home.pill_ethical')}</span>
              <span className="hs-hero__pill"><FiTruck size={13}/> {t('home.pill_fast')}</span>
            </div>
          </div>
          <div className="hs-hero__right">
            <img src={herooImg} alt="Mix&Match Frip collection" className="hs-hero__right-img" />
            <Link to="/nouveautes" className="hs-hero__badge">
              <span className="hs-hero__badge-text">
                {t('home.badge_new_collection').split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </span>
              <FiArrowRight size={18} className="hs-hero__badge-arrow"/>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CATÉGORIES ══ */}
      {categories.length > 0 && (
        <section className="hs-section hs-cats">
          <div className="hs-container">
            <h2 className="hs-cats__title">{t('home.categories_title')}</h2>
            <div className="hs-cats__pills">
              {categories.map(cat => {
                const Icon = CAT_ICONS[cat.slug] || FiTag
                return (
                  <Link key={cat.slug} to={`/catalogue?category=${cat.slug}`} className="hs-cat-pill">
                    <span className="hs-cat-pill__icon"><Icon size={16}/></span>
                    <span className="hs-cat-pill__name">{loc(cat, 'name', lng)}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ NOUVEAUX ARRIVAGES ══ */}
      {products.length > 0 && (
        <section className="hs-section" style={{ background: 'var(--cream)' }}>
          <div className="hs-container">
            <div className="hs-section-header">
              <h2 className="hs-section-title">
                {t('home.new_arrivals_title')} <FiStar size={15} style={{ marginLeft: 4, color: 'var(--gold)' }}/>
              </h2>
              <Link to="/catalogue" className="hs-section-link">
                {t('home.see_all_items')} <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="hs-products__grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="hs-products__more">
              <Link to="/catalogue" className="btn-dark-outline">{t('home.see_all_items')}</Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ BANNER PROMO ══ */}
      <section className="hs-banner">
        <img src={bannerImg} alt="Soldes" className="hs-banner__bg-img" />
        <div className="hs-banner__overlay" />
        <div className="hs-banner__content">
          <p className="hs-banner__eyebrow">{t('home.banner_eyebrow')}</p>
          <h2 className="hs-banner__title">
            {t('home.banner_title').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>
          <p className="hs-banner__sub">{t('home.banner_sub')}</p>
          <Link to="/soldes" className="btn-gold">{t('home.banner_cta')}</Link>
        </div>
      </section>

      {/* ══ POURQUOI NOUS ══ */}
      <section className="hs-section hs-perks">
        <div className="hs-container">
          <div className="hs-section-header">
            <h2 className="hs-section-title">{t('home.why_title')}</h2>
          </div>
          <div className="hs-perks__grid">
            {PERKS.map(p => (
              <div key={p.title} className="hs-perk">
                <span className="hs-perk__icon"><p.Icon size={24}/></span>
                <h4 className="hs-perk__title">{p.title}</h4>
                <p className="hs-perk__desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT SPLIT ══ */}
      <section className="hs-section hs-about" style={{ background: 'var(--cream)' }}>
        <div className="hs-container">
          <div className="hs-about__grid">
            <div className="hs-about__img-wrap">
              <img src={aboutImg} alt="Notre histoire" className="hs-about__img" />
              <div className="hs-about__img-accent" />
            </div>
            <div className="hs-about__text">
              <span className="hs-about__eyebrow">{t('home.about_eyebrow')}</span>
              <h2 className="hs-about__title">
                {t('home.about_title').split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </h2>
              <p className="hs-about__body">{t('home.about_body1')}</p>
              <p className="hs-about__body">{t('home.about_body2')}</p>
              <Link to="/about" className="btn-dark-outline" style={{ marginTop: '8px' }}>
                {t('home.about_cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INSTAGRAM STRIP ══ */}
      <section className="hs-section hs-insta">
        <div className="hs-container">
          <div className="hs-section-header">
            <h2 className="hs-section-title">
              <SiInstagram size={20} style={{ marginRight: 8, color: 'var(--gold)' }} />
              @mixmatch_frip
            </h2>
            <a href="https://www.instagram.com/mixmatch_frip" target="_blank" rel="noopener noreferrer" className="hs-section-link">
              {t('home.insta_follow')} <FiArrowRight size={14} />
            </a>
          </div>
          <div className="hs-insta__grid">
            {INSTA_IMGS.map((src, i) => (
              <div key={i} className="hs-insta__tile">
                <img src={src} alt={`Instagram ${i + 1}`} className="hs-insta__img" />
                <div className="hs-insta__hover"><SiInstagram size={22} color="#fff" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NEWSLETTER ══ */}
      <section className="hs-newsletter">
        <div className="hs-container">
          <div className="hs-newsletter__inner">
            <div className="hs-newsletter__text">
              <h2 className="hs-newsletter__title">{t('home.newsletter_title')}</h2>
              <p className="hs-newsletter__sub">{t('home.newsletter_sub')}</p>
            </div>
            {subscribed ? (
              <div className="hs-newsletter__thanks">
                <FiCheckCircle size={18} style={{ marginRight: 8, color: 'var(--gold)' }}/>
                {t('home.newsletter_success')}
              </div>
            ) : (
              <form className="hs-newsletter__form" onSubmit={handleNewsletter}>
                <input type="email" placeholder={t('home.newsletter_placeholder')}
                  className="hs-newsletter__input" value={email}
                  onChange={e => setEmail(e.target.value)} required />
                <button type="submit" className="btn-gold">{t('home.newsletter_btn')}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
