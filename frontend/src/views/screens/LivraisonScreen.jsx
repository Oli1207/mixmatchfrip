import { Link } from 'react-router-dom'
import { FiPackage, FiZap, FiMapPin } from 'react-icons/fi'
import './LivraisonScreen.css'

const ZONES = [
  { province: 'Québec',              standard: '5-7 jours',   express: '2-3 jours', standardPrice: 'Gratuit (>75$) / 4.99$ CAD', expressPrice: '12.99$ CAD' },
  { province: 'Ontario',             standard: '5-7 jours',   express: '2-3 jours', standardPrice: '6.99$ CAD',                   expressPrice: '14.99$ CAD' },
  { province: 'Colombie-Brit.',      standard: '7-10 jours',  express: '3-5 jours', standardPrice: '8.99$ CAD',                   expressPrice: '17.99$ CAD' },
  { province: 'Provinces de l\'Atlantique', standard: '7-10 jours', express: '3-5 jours', standardPrice: '8.99$ CAD',             expressPrice: '17.99$ CAD' },
  { province: 'Prairies & Alberta',  standard: '7-10 jours',  express: '3-5 jours', standardPrice: '7.99$ CAD',                   expressPrice: '15.99$ CAD' },
]

const STEPS = [
  { num: '01', title: 'Commande confirmée',   desc: 'Vous recevez un email de confirmation avec votre récapitulatif.' },
  { num: '02', title: 'Préparation',          desc: 'Notre équipe prépare et emballe votre commande avec soin (24-48h).' },
  { num: '03', title: 'Expédition',           desc: 'Votre colis part via Chit Chats. Un numéro de suivi vous est envoyé.' },
  { num: '04', title: 'Livraison',            desc: 'Votre commande arrive à votre porte selon le mode choisi.' },
]

export default function LivraisonScreen() {
  return (
    <div className="livraison-page">
      <div className="livraison-header">
        <div className="livraison-header__inner">
          <p className="livraison-header__tag">Informations</p>
          <h1 className="livraison-header__title">Livraison & Retours</h1>
          <p className="livraison-header__sub">Tout ce que vous devez savoir sur la livraison de vos commandes.</p>
        </div>
      </div>

      <div className="livraison-body">
        {/* Options */}
        <section className="livraison-section">
          <div className="livraison-section__inner">
            <h2 className="livraison-section__title">Options de livraison</h2>
            <div className="livraison-options">
              <div className="livraison-option">
                <span className="livraison-option__icon"><FiPackage size={22}/></span>
                <div>
                  <h3 className="livraison-option__name">Standard</h3>
                  <p className="livraison-option__desc">Via Chit Chats. Livraison en 5 à 10 jours ouvrables selon votre province.</p>
                  <p className="livraison-option__price">À partir de 4.99$ CAD · <strong>Gratuit dès 75$ CAD au Québec</strong></p>
                </div>
              </div>
              <div className="livraison-option">
                <span className="livraison-option__icon"><FiZap size={22}/></span>
                <div>
                  <h3 className="livraison-option__name">Express</h3>
                  <p className="livraison-option__desc">Priorité d'expédition. Livraison en 2 à 5 jours ouvrables selon votre province.</p>
                  <p className="livraison-option__price">À partir de 12.99$ CAD</p>
                </div>
              </div>
              <div className="livraison-option">
                <span className="livraison-option__icon"><FiMapPin size={22}/></span>
                <div>
                  <h3 className="livraison-option__name">Retrait en magasin</h3>
                  <p className="livraison-option__desc">Disponible à notre boutique de Montréal. Prêt sous 24h après confirmation.</p>
                  <p className="livraison-option__price"><strong>Gratuit</strong></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="livraison-section livraison-section--cream">
          <div className="livraison-section__inner">
            <h2 className="livraison-section__title">Processus d'expédition</h2>
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
            <h2 className="livraison-section__title">Tarifs par province</h2>
            <div className="livraison-table-wrap">
              <table className="livraison-table">
                <thead>
                  <tr>
                    <th>Province</th>
                    <th>Standard</th>
                    <th>Délai Standard</th>
                    <th>Express</th>
                    <th>Délai Express</th>
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
              <h2 className="livraison-section__title">Politique de retour</h2>
              <ul className="livraison-returns__list">
                <li>Retour accepté dans les <strong>48 heures</strong> après réception</li>
                <li>Articles en état d'origine, non portés</li>
                <li>Étiquette de retour prépayée fournie par nos soins</li>
                <li>Remboursement traité sous <strong>5-7 jours ouvrables</strong></li>
                <li>Retour gratuit pour tout article non conforme à la description</li>
              </ul>
              <p className="livraison-returns__note">
                Pour initier un retour, contactez-nous à <a href="mailto:contact@mixmatchfrip.ca">contact@mixmatchfrip.ca</a> avec votre numéro de commande.
              </p>
            </div>
            <div className="livraison-returns__cta">
              <h3>Une question ?</h3>
              <p>Notre équipe est là pour vous aider du lundi au vendredi, de 9h à 18h.</p>
              <Link to="/faq" className="btn-gold">Voir la FAQ</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
