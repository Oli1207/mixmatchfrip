import { Link } from 'react-router-dom'
import { FiRefreshCw, FiCheck, FiFeather, FiHeart } from 'react-icons/fi'
import aboutImg from '../../assets/about.jpg'
import bannerImg from '../../assets/banner.jpg'
import './AboutScreen.css'
import SEOHead, { schemaOrganization } from '../../components/SEOHead'

const VALUES = [
  { Icon: FiRefreshCw, title: 'Mode circulaire',   desc: 'Chaque pièce a une histoire. Nous lui donnons une seconde vie plutôt qu\'une destination en décharge.' },
  { Icon: FiCheck,     title: 'Qualité vérifiée',  desc: 'Chaque article est inspecté, nettoyé et authentifié par notre équipe avant d\'être mis en vente.' },
  { Icon: FiFeather,   title: 'Impact réduit',     desc: 'Choisir le seconde-main réduit la production textile et diminue notre empreinte carbone collective.' },
  { Icon: FiHeart,     title: 'Communauté locale', desc: 'Basées à Montréal, nous soutenons une mode plus responsable et une économie locale plus forte.' },
]

const TEAM = [
  { name: 'Sophie Tremblay', role: 'Fondatrice & Curatrice',    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop' },
  { name: 'Léa Fontaine',    role: 'Styliste & Sélectionneuse', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop' },
  { name: 'Marc Dubois',     role: 'Responsable logistique',    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop' },
]

export default function AboutScreen() {
  return (
    <div className="about-page">
      <SEOHead
        title="À propos"
        description="MixMatchFrip, friperie en ligne à Montréal. Notre mission : rendre la mode seconde main aussi désirable que la mode neuve. Mode circulaire, qualité vérifiée, impact réduit."
        url="/about"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            schemaOrganization,
            { '@type': 'AboutPage', name: 'À propos — MixMatchFrip', url: 'https://mixmatchfrip.com/about' },
          ],
        }}
      />
      {/* Hero */}
      <section className="about-hero" style={{ backgroundImage: `url(${bannerImg})` }}>
        <div className="about-hero__overlay" />
        <div className="about-hero__content">
          <p className="about-hero__tag">Notre histoire</p>
          <h1 className="about-hero__title">La mode durable,<br />sans compromis.</h1>
        </div>
      </section>

      {/* Story */}
      <section className="about-story">
        <div className="about-story__grid">
          <div className="about-story__img-wrap">
            <img src={aboutImg} alt="Boutique Mix&Match Frip" className="about-story__img" />
          </div>
          <div className="about-story__text">
            <p className="about-story__tag">Qui sommes-nous</p>
            <h2 className="about-story__title">Née d'une passion,<br />portée par une mission</h2>
            <p>Mix&Match Frip a été fondée en 2021 à Montréal avec une idée simple : rendre la mode secondaire aussi désirable que la mode neuve.</p>
            <p>Nous sélectionnons à la main chaque pièce — robes, manteaux, bijoux, accessoires — pour construire une garde-robe curatée, moderne et éthique.</p>
            <p>Parce que le plus beau vêtement est celui qui existe déjà.</p>
            <Link to="/catalogue" className="btn-gold">Découvrir la boutique</Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="about-values__inner">
          <h2 className="about-values__title">Nos valeurs</h2>
          <div className="about-values__grid">
            {VALUES.map(v => (
              <div key={v.title} className="about-value-card">
                <span className="about-value-card__icon"><v.Icon size={22}/></span>
                <h3 className="about-value-card__title">{v.title}</h3>
                <p className="about-value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="about-team">
        <div className="about-team__inner">
          <h2 className="about-team__title">L'équipe</h2>
          <p className="about-team__sub">Des passionnées de mode qui croient en un avenir plus responsable.</p>
          <div className="about-team__grid">
            {TEAM.map(m => (
              <div key={m.name} className="about-team-card">
                <div className="about-team-card__img-wrap">
                  <img src={m.img} alt={m.name} className="about-team-card__img" />
                </div>
                <h3 className="about-team-card__name">{m.name}</h3>
                <p className="about-team-card__role">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2 className="about-cta__title">Rejoignez le mouvement</h2>
        <p className="about-cta__text">Donnez une seconde vie à des vêtements uniques tout en consommant de façon responsable.</p>
        <div className="about-cta__actions">
          <Link to="/catalogue" className="btn-gold">Explorer la boutique</Link>
          <Link to="/contact"   className="btn-white-outline">Nous contacter</Link>
        </div>
      </section>
    </div>
  )
}
