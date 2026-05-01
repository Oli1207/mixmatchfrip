import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiRefreshCw, FiCheck, FiFeather, FiHeart } from 'react-icons/fi'
import aboutImg from '../../assets/about.jpg'
import bannerImg from '../../assets/banner.jpg'
import './AboutScreen.css'
import SEOHead, { schemaOrganization } from '../../components/SEOHead'

const TEAM_IMGS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
]

const TEAM_NAMES = ['Sophie Tremblay', 'Léa Fontaine', 'Marc Dubois']

export default function AboutScreen() {
  const { t } = useTranslation()

  const VALUES = [
    { Icon: FiRefreshCw, title: t('about.value1_title'), desc: t('about.value1_desc') },
    { Icon: FiCheck,     title: t('about.value2_title'), desc: t('about.value2_desc') },
    { Icon: FiFeather,   title: t('about.value3_title'), desc: t('about.value3_desc') },
    { Icon: FiHeart,     title: t('about.value4_title'), desc: t('about.value4_desc') },
  ]

  const TEAM = [
    { name: TEAM_NAMES[0], role: t('about.team_member1_role'), img: TEAM_IMGS[0] },
    { name: TEAM_NAMES[1], role: t('about.team_member2_role'), img: TEAM_IMGS[1] },
    { name: TEAM_NAMES[2], role: t('about.team_member3_role'), img: TEAM_IMGS[2] },
  ]

  return (
    <div className="about-page">
      <SEOHead
        title={t('about.hero_title').replace('\n', ', ').replace(/,\s*$/, '')}
        description="MixMatchFrip, friperie en ligne à Gatineau. Notre mission : rendre la mode seconde main aussi désirable que la mode neuve. Mode circulaire, qualité vérifiée, impact réduit."
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
          <p className="about-hero__tag">{t('about.hero_tag')}</p>
          <h1 className="about-hero__title">
            {t('about.hero_title').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="about-story">
        <div className="about-story__grid">
          <div className="about-story__img-wrap">
            <img src={aboutImg} alt="Boutique Mix&Match Frip" className="about-story__img" />
          </div>
          <div className="about-story__text">
            <p className="about-story__tag">{t('about.story_tag')}</p>
            <h2 className="about-story__title">
              {t('about.story_title').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p>{t('about.story_p1')}</p>
            <p>{t('about.story_p2')}</p>
            <p>{t('about.story_p3')}</p>
            <p>{t('about.story_p4')}</p>
            <Link to="/catalogue" className="btn-gold">{t('about.story_cta')}</Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="about-values__inner">
          <h2 className="about-values__title">{t('about.values_title')}</h2>
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
          <h2 className="about-team__title">{t('about.team_title')}</h2>
          <p className="about-team__sub">{t('about.team_sub')}</p>
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
        <h2 className="about-cta__title">{t('about.cta_title')}</h2>
        <p className="about-cta__text">{t('about.cta_text')}</p>
        <div className="about-cta__actions">
          <Link to="/catalogue" className="btn-gold">{t('about.cta_shop')}</Link>
          <Link to="/contact"   className="btn-white-outline">{t('about.cta_contact')}</Link>
        </div>
      </section>
    </div>
  )
}
