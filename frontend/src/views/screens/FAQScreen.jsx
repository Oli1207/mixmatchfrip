import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './FAQScreen.css'
import SEOHead, { schemaFAQ } from '../../components/SEOHead'

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item ${open ? 'faq-item--open' : ''}`}>
      <button className="faq-item__trigger" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        {open ? <FiMinus size={18} /> : <FiPlus size={18} />}
      </button>
      {open && <div className="faq-item__answer">{a}</div>}
    </div>
  )
}

export default function FAQScreen() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState(null)

  const CATEGORIES = [
    {
      title: t('faq.cat1_title'),
      items: [
        { q: t('faq.cat1_q1'), a: t('faq.cat1_a1') },
        { q: t('faq.cat1_q2'), a: t('faq.cat1_a2') },
        { q: t('faq.cat1_q3'), a: t('faq.cat1_a3') },
      ],
    },
    {
      title: t('faq.cat2_title'),
      items: [
        { q: t('faq.cat2_q1'), a: t('faq.cat2_a1') },
        { q: t('faq.cat2_q2'), a: t('faq.cat2_a2') },
        { q: t('faq.cat2_q3'), a: t('faq.cat2_a3') },
      ],
    },
    {
      title: t('faq.cat3_title'),
      items: [
        { q: t('faq.cat3_q1'), a: t('faq.cat3_a1') },
        { q: t('faq.cat3_q2'), a: t('faq.cat3_a2') },
        { q: t('faq.cat3_q3'), a: t('faq.cat3_a3') },
      ],
    },
    {
      title: t('faq.cat4_title'),
      items: [
        { q: t('faq.cat4_q1'), a: t('faq.cat4_a1') },
        { q: t('faq.cat4_q2'), a: t('faq.cat4_a2') },
        { q: t('faq.cat4_q3'), a: t('faq.cat4_a3') },
      ],
    },
  ]

  const displayed = activeCategory
    ? CATEGORIES.filter(c => c.title === activeCategory)
    : CATEGORIES

  const allFaqItems = CATEGORIES.flatMap(c => c.items)

  return (
    <div className="faq-page">
      <SEOHead
        title={t('faq.title')}
        description="Toutes les réponses à vos questions sur les commandes, la livraison, les retours et la qualité des articles MixMatchFrip."
        url="/faq"
        schema={schemaFAQ(allFaqItems)}
      />
      <div className="faq-header">
        <div className="faq-header__inner">
          <p className="faq-header__tag">{t('faq.help_tag')}</p>
          <h1 className="faq-header__title">{t('faq.title')}</h1>
          <p className="faq-header__sub">{t('faq.subtitle')}</p>
        </div>
      </div>

      <div className="faq-body">
        <div className="faq-container">
          {/* Filter tabs */}
          <div className="faq-tabs">
            <button
              className={`faq-tab ${!activeCategory ? 'faq-tab--active' : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              {t('faq.tab_all')}
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.title}
                className={`faq-tab ${activeCategory === c.title ? 'faq-tab--active' : ''}`}
                onClick={() => setActiveCategory(c.title)}
              >
                {c.title}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="faq-content">
            {displayed.map(cat => (
              <div key={cat.title} className="faq-category">
                <h2 className="faq-category__title">{cat.title}</h2>
                <div className="faq-category__items">
                  {cat.items.map(item => (
                    <AccordionItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="faq-contact">
            <h3 className="faq-contact__title">{t('faq.contact_title')}</h3>
            <p className="faq-contact__text">{t('faq.contact_text')}</p>
            <div className="faq-contact__actions">
              <a href="mailto:support@mixmatchfrip.com" className="btn-gold">{t('faq.contact_write')}</a>
              <Link to="/livraison" className="btn-dark-outline">{t('faq.contact_shipping')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
