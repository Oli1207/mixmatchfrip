import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiPackage, FiZap, FiMapPin } from 'react-icons/fi'
import './LivraisonScreen.css'
import SEOHead from '../../components/SEOHead'

const ZONES = [
  { province: 'Québec',              standard: '5-7 j',   express: '2-3 j', standardPrice: 'Gratuit (>75$) / 4.99$ CAD', expressPrice: '12.99$ CAD' },
  { province: 'Ontario',             standard: '5-7 j',   express: '2-3 j', standardPrice: '6.99$ CAD',                   expressPrice: '14.99$ CAD' },
  { province: 'Colombie-Brit.',      standard: '7-10 j',  express: '3-5 j', standardPrice: '8.99$ CAD',                   expressPrice: '17.99$ CAD' },
  { province: 'Provinces Atlantique', standard: '7-10 j', express: '3-5 j', standardPrice: '8.99$ CAD',                   expressPrice: '17.99$ CAD' },
  { province: 'Prairies & Alberta',  standard: '7-10 j',  express: '3-5 j', standardPrice: '7.99$ CAD',                   expressPrice: '15.99$ CAD' },
]

export default function LivraisonScreen() {
  const { t } = useTranslation()

  const STEPS = [
    { num: '01', title: t('shipping_page.step1_title'), desc: t('shipping_page.step1_desc') },
    { num: '02', title: t('shipping_page.step2_title'), desc: t('shipping_page.step2_desc') },
    { num: '03', title: t('shipping_page.step3_title'), desc: t('shipping_page.step3_desc') },
    { num: '04', title: t('shipping_page.step4_title'), desc: t('shipping_page.step4_desc') },
  ]

  return (
    <div className="livraison-page">
      <SEOHead
        title={t('shipping_page.title')}
        description="Informations sur la livraison MixMatchFrip : délais, tarifs par province, politique de retour sous 48h. Livraison standard et express partout au Canada."
        url="/livraison"
      />
      <div className="livraison-header">
        <div className="livraison-header__inner">
          <p className="livraison-header__tag">{t('shipping_page.info_tag')}</p>
          <h1 className="livraison-header__title">{t('shipping_page.title')}</h1>
          <p className="livraison-header__sub">{t('shipping_page.page_subtitle')}</p>
        </div>
      </div>

      <div className="livraison-body">
        {/* Options */}
        <section className="livraison-section">
          <div className="livraison-section__inner">
            <h2 className="livraison-section__title">{t('shipping_page.options_title')}</h2>
            <div className="livraison-options">
              <div className="livraison-option">
                <span className="livraison-option__icon"><FiPackage size={22}/></span>
                <div>
                  <h3 className="livraison-option__name">{t('shipping_page.standard_name')}</h3>
                  <p className="livraison-option__desc">{t('shipping_page.standard_via')}</p>
                  <p className="livraison-option__price">{t('shipping_page.standard_price')}</p>
                </div>
              </div>
              <div className="livraison-option">
                <span className="livraison-option__icon"><FiZap size={22}/></span>
                <div>
                  <h3 className="livraison-option__name">{t('shipping_page.express_name')}</h3>
                  <p className="livraison-option__desc">{t('shipping_page.express_via')}</p>
                  <p className="livraison-option__price">{t('shipping_page.express_price')}</p>
                </div>
              </div>
              <div className="livraison-option">
                <span className="livraison-option__icon"><FiMapPin size={22}/></span>
                <div>
                  <h3 className="livraison-option__name">{t('shipping_page.pickup_name')}</h3>
                  <p className="livraison-option__desc">{t('shipping_page.pickup_desc')}</p>
                  <p className="livraison-option__price"><strong>{t('shipping_page.pickup_price')}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="livraison-section livraison-section--cream">
          <div className="livraison-section__inner">
            <h2 className="livraison-section__title">{t('shipping_page.process_title')}</h2>
            <div className="livraison-steps">
              {STEPS.map(step => (
                <div key={step.num} className="livraison-step">
                  <span className="livraison-step__num">{step.num}</span>
                  <h3 className="livraison-step__title">{step.title}</h3>
                  <p className="livraison-step__desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Zones table */}
        <section className="livraison-section">
          <div className="livraison-section__inner">
            <h2 className="livraison-section__title">{t('shipping_page.rates_by_province')}</h2>
            <div className="livraison-table-wrap">
              <table className="livraison-table">
                <thead>
                  <tr>
                    <th>{t('shipping_page.province_col')}</th>
                    <th>{t('shipping_page.standard_col')}</th>
                    <th>{t('shipping_page.standard_delay_col')}</th>
                    <th>{t('shipping_page.express_col')}</th>
                    <th>{t('shipping_page.express_delay_col')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ZONES.map(z => (
                    <tr key={z.province}>
                      <td><strong>{z.province}</strong></td>
                      <td>{z.standardPrice}</td>
                      <td>{z.standard}</td>
                      <td>{z.expressPrice}</td>
                      <td>{z.express}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Returns */}
        <section className="livraison-section livraison-section--cream">
          <div className="livraison-section__inner livraison-returns">
            <div>
              <h2 className="livraison-section__title">{t('shipping_page.returns_policy_title')}</h2>
              <ul className="livraison-returns__list">
                <li>{t('shipping_page.return_48h')}</li>
                <li>{t('shipping_page.return_original')}</li>
                <li>{t('shipping_page.return_label')}</li>
                <li>{t('shipping_page.return_refund')}</li>
                <li>{t('shipping_page.return_free')}</li>
              </ul>
              <p className="livraison-returns__note">
                {t('shipping_page.return_contact_pre')} <a href="mailto:support@mixmatchfrip.com">support@mixmatchfrip.com</a> {t('shipping_page.return_contact_post')}
              </p>
            </div>
            <div className="livraison-returns__cta">
              <h3>{t('shipping_page.question_title')}</h3>
              <p>{t('shipping_page.question_text')}</p>
              <Link to="/faq" className="btn-gold">{t('shipping_page.see_faq')}</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
