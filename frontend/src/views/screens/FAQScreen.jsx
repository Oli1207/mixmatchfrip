import { useState } from 'react'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './FAQScreen.css'
import SEOHead, { schemaFAQ } from '../../components/SEOHead'

const CATEGORIES = [
  {
    title: 'Commandes & Paiement',
    items: [
      { q: 'Quels modes de paiement acceptez-vous ?', a: 'Nous acceptons les cartes Visa, Mastercard et American Express via notre partenaire de paiement sécurisé Stripe. Toutes les transactions sont chiffrées.' },
      { q: 'Puis-je modifier ou annuler ma commande ?', a: 'Vous pouvez annuler votre commande dans les 2 heures suivant l\'achat en nous contactant par email. Passé ce délai, la commande est déjà en traitement.' },
      { q: 'Ma commande est-elle sécurisée ?', a: 'Absolument. Toutes vos informations personnelles et bancaires sont protégées par un chiffrement SSL de bout en bout. Nous ne stockons jamais vos données de carte.' },
    ],
  },
  {
    title: 'Livraison',
    items: [
      { q: 'Quels sont les délais de livraison ?', a: 'Livraison standard : 5-7 jours ouvrables. Livraison express : 2-3 jours ouvrables. Retrait en magasin disponible à Montréal sans frais.' },
      { q: 'Livrez-vous partout au Canada ?', a: 'Oui, nous livrons dans toutes les provinces canadiennes via Canada Post. Des frais de livraison peuvent s\'appliquer selon votre province.' },
      { q: 'Comment suivre ma commande ?', a: 'Vous recevrez un email avec votre numéro de suivi Canada Post dès que votre colis sera expédié. Vous pouvez suivre votre commande sur canadapost.ca.' },
    ],
  },
  {
    title: 'Retours & Échanges',
    items: [
      { q: 'Quelle est votre politique de retour ?', a: 'Vous disposez de 48 heures après réception de votre commande pour initier un retour. Les articles doivent être dans leur état d\'origine, non portés.' },
      { q: 'Comment effectuer un retour ?', a: 'Contactez-nous par email avec votre numéro de commande. Nous vous enverrons une étiquette de retour prépayée. Le remboursement est traité sous 5-7 jours.' },
      { q: 'Les frais de retour sont-ils à ma charge ?', a: 'Non, les frais de retour sont pris en charge par Mix&Match Frip pour tout article non conforme à la description. Pour un retour personnel, des frais de 4.99$ s\'appliquent.' },
    ],
  },
  {
    title: 'Articles & Qualité',
    items: [
      { q: 'Comment évaluez-vous l\'état des articles ?', a: 'Nous utilisons 4 niveaux : Neuf avec étiquette, Excellent état, Très bon état, Bon état. Chaque article est inspecté, nettoyé et photographié par notre équipe.' },
      { q: 'Les articles sont-ils authentiques ?', a: 'Oui, chaque article de marque est authentifié par nos stylistes avant la mise en vente. Nous ne vendons aucune contrefaçon.' },
      { q: 'Puis-je vendre mes vêtements sur Mix&Match Frip ?', a: 'Nous travaillons sur un programme de dépôt-vente ! Pour l\'instant, contactez-nous directement par email pour discuter de vos articles.' },
    ],
  },
]

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
  const [activeCategory, setActiveCategory] = useState(null)

  const displayed = activeCategory
    ? CATEGORIES.filter(c => c.title === activeCategory)
    : CATEGORIES

  const allFaqItems = CATEGORIES.flatMap(c => c.items)

  return (
    <div className="faq-page">
      <SEOHead
        title="FAQ — Questions fréquentes"
        description="Toutes les réponses à vos questions sur les commandes, la livraison, les retours et la qualité des articles MixMatchFrip."
        url="/faq"
        schema={schemaFAQ(allFaqItems)}
      />
      <div className="faq-header">
        <div className="faq-header__inner">
          <p className="faq-header__tag">Aide</p>
          <h1 className="faq-header__title">Questions fréquentes</h1>
          <p className="faq-header__sub">Trouvez rapidement les réponses à vos questions.</p>
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
              Toutes
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
            <h3 className="faq-contact__title">Vous n'avez pas trouvé votre réponse ?</h3>
            <p className="faq-contact__text">Notre équipe est disponible du lundi au vendredi de 9h à 18h.</p>
            <div className="faq-contact__actions">
              <a href="mailto:support@mixmatchfrip.com" className="btn-gold">Nous écrire</a>
              <Link to="/livraison" className="btn-dark-outline">Infos livraison</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
