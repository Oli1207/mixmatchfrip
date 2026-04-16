import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI, categoriesAPI } from '../../utils/api'
import {
  FiArrowRight, FiChevronRight,
  FiTag, FiShoppingBag, FiZap, FiHeart, FiUser, FiStar,
  FiCompass, FiCircle, FiBox, FiPackage, FiMenu,
  FiFeather, FiCheckCircle, FiTruck, FiRefreshCw,
} from 'react-icons/fi'
import { SiInstagram } from 'react-icons/si'
import { formatPrice } from '../../utils/currency'

// ── Images
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

// Icônes par slug de catégorie (composants react-icons)
const CAT_ICONS = {
  hauts:       FiShoppingBag,
  pantalons:   FiMenu,
  vestes:      FiZap,
  robes:       FiHeart,
  accessoires: FiTag,
  femme:       FiUser,
  homme:       FiUser,
  enfant:      FiStar,
  chaussures:  FiCompass,
  jupes:       FiCircle,
  manteaux:    FiPackage,
  shorts:      FiBox,
}

const INSTA_IMGS = [insta1, insta2, insta3, insta4, insta5, insta6]

const PERKS = [
  { Icon: FiFeather,     title: 'Mode durable',     desc: "Chaque achat prolonge la vie d'un vêtement et réduit notre empreinte." },
  { Icon: FiCheckCircle, title: 'Pièces vérifiées', desc: 'Chaque article est soigneusement contrôlé avant mise en ligne.' },
  { Icon: FiTruck,       title: 'Livraison rapide', desc: 'Expédition via Chit Chats partout au pays, dès 4,99 $ CAD.' },
  { Icon: FiRefreshCw,   title: 'Retours faciles',  desc: 'Non conforme ? Nous gérons le retour sous 48h.' },
]

/* ── Carte produit ── */
function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const imgUrl   = product.main_image_url || 'https://via.placeholder.com/400x500?text=Photo'
  const discount = product.discount_percent

  return (
    <div
      className={`hs-card${hovered ? ' hs-card--hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="hs-card__img-wrap">
        <img src={imgUrl} alt={product.name} className="hs-card__img" loading="lazy"/>
        {discount > 0 && <span className="hs-card__badge hs-card__badge--off">-{discount}%</span>}
        <div className={`hs-card__overlay${hovered ? ' visible' : ''}`}>
          <Link to={`/product/${product.slug}`} className="hs-card__cta">Voir l'article</Link>
        </div>
      </div>
      <div className="hs-card__info">
        <span className="hs-card__brand">{product.brand}</span>
        <h3 className="hs-card__name">{product.name}</h3>
        <div className="hs-card__meta">
          <span className="hs-card__tag">Taille {product.size}</span>
          <span className="hs-card__tag">{product.condition}</span>
        </div>
        <div className="hs-card__prices">
          <span className="hs-card__price">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="hs-card__original">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Page ── */
export default function HomeScreen() {
  const [email,      setEmail]      = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])

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

  return (
    <div className="hs">

      {/* ══ HERO ══ */}
      <section className="hs-hero">
        <div className="hs-hero__inner">

          {/* Côté gauche — texte */}
          <div className="hs-hero__left">
            <p className="hs-hero__eyebrow">Collection Printemps 2026</p>
            <h1 className="hs-hero__title">
              Mix, match,<br />
              révèle ton <em>style.</em>
              <span className="hs-hero__heart">♡</span>
            </h1>
            <p className="hs-hero__sub">
              Des pièces uniques, chinées avec soin.<br />
              Pour un look qui te ressemble.
            </p>
            <div className="hs-hero__actions">
              <Link to="/catalogue" className="btn-gold">
                DÉCOUVRIR LA BOUTIQUE <FiArrowRight size={15} style={{ marginLeft: 6 }}/>
              </Link>
              <Link to="/nouveautes" className="btn-dark-outline">
                VOIR LES NOUVEAUTÉS
              </Link>
            </div>
            <div className="hs-hero__pills">
              <span className="hs-hero__pill"><FiTag size={13}/> Pièces uniques</span>
              <span className="hs-hero__pill"><FiFeather size={13}/> Sélection éthique</span>
              <span className="hs-hero__pill"><FiTruck size={13}/> Livraison rapide</span>
            </div>
          </div>

          {/* Côté droit — photo */}
          <div className="hs-hero__right">
            <img src={herooImg} alt="Mix&Match Frip collection" className="hs-hero__right-img" />
            <Link to="/nouveautes" className="hs-hero__badge">
              <span className="hs-hero__badge-text">NOUVELLE<br/>COLLECTION</span>
              <FiArrowRight size={18} className="hs-hero__badge-arrow"/>
            </Link>
          </div>

        </div>
      </section>

      {/* ══ CATÉGORIES EN PILLS ══ */}
      {categories.length > 0 && (
        <section className="hs-section hs-cats">
          <div className="hs-container">
            <h2 className="hs-cats__title">CATÉGORIES</h2>
            <div className="hs-cats__pills">
              {categories.map(cat => {
                const Icon = CAT_ICONS[cat.slug] || FiTag
                return (
                  <Link
                    key={cat.slug}
                    to={`/catalogue?category=${cat.slug}`}
                    className="hs-cat-pill"
                  >
                    <span className="hs-cat-pill__icon"><Icon size={16}/></span>
                    <span className="hs-cat-pill__name">{cat.name}</span>
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
                Nouveautés <FiStar size={15} style={{ marginLeft: 4, color: 'var(--gold)' }}/>
              </h2>
              <Link to="/catalogue" className="hs-section-link">
                Tout voir <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="hs-products__grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="hs-products__more">
              <Link to="/catalogue" className="btn-dark-outline">Voir tous les articles</Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ BANNER PROMO ══ */}
      <section className="hs-banner">
        <img src={bannerImg} alt="Soldes" className="hs-banner__bg-img" />
        <div className="hs-banner__overlay" />
        <div className="hs-banner__content">
          <p className="hs-banner__eyebrow">Offre limitée</p>
          <h2 className="hs-banner__title">
            Jusqu'à <span>-60%</span><br />sur la sélection Soldes
          </h2>
          <p className="hs-banner__sub">
            Des centaines de pièces à petits prix, renouvelées chaque semaine.
          </p>
          <Link to="/soldes" className="btn-gold">Profiter des soldes</Link>
        </div>
      </section>

      {/* ══ POURQUOI NOUS ══ */}
      <section className="hs-section hs-perks">
        <div className="hs-container">
          <div className="hs-section-header">
            <h2 className="hs-section-title">Pourquoi Mix&Match Frip ?</h2>
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
              <span className="hs-about__eyebrow">Notre histoire</span>
              <h2 className="hs-about__title">
                La mode durable,<br /><em>c'est notre mission.</em>
              </h2>
              <p className="hs-about__body">
                Mix&Match Frip est née d'une conviction simple : un vêtement bien aimé mérite
                une deuxième vie. Nous sélectionnons avec soin des pièces de qualité pour que
                vous puissiez vous habiller avec style, à prix juste, et en conscience.
              </p>
              <p className="hs-about__body">
                Chaque article passe par notre contrôle qualité avant d'être mis en ligne.
                Parce que la confiance, ça se mérite.
              </p>
              <Link to="/about" className="btn-dark-outline" style={{ marginTop: '8px' }}>
                En savoir plus
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
              @mixmatchfrip
            </h2>
            <a
              href="https://www.instagram.com/mixmatchfrip"
              target="_blank"
              rel="noopener noreferrer"
              className="hs-section-link"
            >
              Suivre <FiArrowRight size={14} />
            </a>
          </div>
          <div className="hs-insta__grid">
            {INSTA_IMGS.map((src, i) => (
              <div key={i} className="hs-insta__tile">
                <img src={src} alt={`Instagram ${i + 1}`} className="hs-insta__img" />
                <div className="hs-insta__hover">
                  <SiInstagram size={22} color="#fff" />
                </div>
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
              <h2 className="hs-newsletter__title">Soyez les premiers informés</h2>
              <p className="hs-newsletter__sub">
                Nouveaux arrivages, offres exclusives et conseils mode —
                directement dans votre boîte mail.
              </p>
            </div>
            {subscribed ? (
              <div className="hs-newsletter__thanks">
                <FiCheckCircle size={18} style={{ marginRight: 8, color: 'var(--gold)' }}/>
                Merci ! Vous êtes bien inscrit(e) à notre newsletter.
              </div>
            ) : (
              <form className="hs-newsletter__form" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="hs-newsletter__input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-gold">S'inscrire</button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
