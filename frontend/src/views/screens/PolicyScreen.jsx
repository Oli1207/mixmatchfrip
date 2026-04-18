import { Link } from 'react-router-dom'
import './PolicyScreen.css'
import SEOHead from '../../components/SEOHead'

const SECTIONS = [
  {
    id: 'collecte',
    title: '1. Informations collectées',
    content: `Lorsque vous utilisez MixMatchFrip, nous collectons les informations suivantes :

• **Informations de compte** : nom, adresse email, mot de passe (chiffré).
• **Informations de livraison** : adresse postale, numéro de téléphone, province et code postal.
• **Informations de commande** : articles achetés, montants, historique de commandes.
• **Données de navigation** : pages visitées, durée des sessions, appareil utilisé (via cookies analytiques anonymes).

Nous ne collectons jamais vos informations de carte bancaire directement — elles sont traitées exclusivement par notre partenaire de paiement Stripe, certifié PCI-DSS.`,
  },
  {
    id: 'utilisation',
    title: '2. Utilisation de vos données',
    content: `Vos données personnelles sont utilisées uniquement pour :

• **Traiter et expédier vos commandes** : transmission à notre partenaire logistique Chit Chats pour la génération des étiquettes d'expédition.
• **Vous envoyer les confirmations de commande** et les mises à jour de suivi par email.
• **Gérer votre compte client** : accès à votre historique, gestion de vos informations.
• **Améliorer notre service** : analyse anonyme du comportement de navigation pour optimiser l'expérience utilisateur.
• **Communications marketing** (newsletter) : uniquement si vous y avez explicitement consenti. Vous pouvez vous désabonner à tout moment.

Vos données ne sont **jamais vendues** à des tiers.`,
  },
  {
    id: 'partage',
    title: '3. Partage avec des tiers',
    content: `Nous partageons vos données uniquement avec les prestataires essentiels au fonctionnement de la boutique :

• **Stripe** : traitement sécurisé des paiements. Politique de confidentialité disponible sur stripe.com.
• **Chit Chats** : expédition des colis (nom, adresse de livraison). Politique disponible sur chitchats.com.
• **Hébergement** : nos serveurs sont hébergés sur des infrastructures sécurisées avec chiffrement des données.

Aucune de vos données n'est partagée à des fins publicitaires ou commerciales avec des tiers.`,
  },
  {
    id: 'cookies',
    title: '4. Cookies',
    content: `MixMatchFrip utilise des cookies essentiels au fonctionnement du site :

• **Cookies de session** : maintiennent votre connexion et votre panier actif entre les pages.
• **Cookies de panier** : permettent de conserver votre panier même sans compte créé.
• **Cookies analytiques** (anonymes) : nous aident à comprendre comment le site est utilisé, sans identifier les visiteurs individuellement.

Vous pouvez désactiver les cookies dans les paramètres de votre navigateur. Notez que cela peut affecter certaines fonctionnalités comme le panier ou la session.`,
  },
  {
    id: 'securite',
    title: '5. Sécurité des données',
    content: `Nous appliquons des mesures de sécurité conformes aux standards du secteur :

• Toutes les communications entre votre navigateur et nos serveurs sont chiffrées via **HTTPS/TLS**.
• Les mots de passe sont stockés sous forme **hachée et salée** — jamais en clair.
• Les données de paiement ne transitent jamais par nos serveurs et sont gérées intégralement par Stripe.
• L'accès aux données personnelles est restreint aux membres de l'équipe qui en ont besoin pour traiter vos commandes.`,
  },
  {
    id: 'droits',
    title: '6. Vos droits',
    content: `Conformément aux lois canadiennes sur la protection de la vie privée (LPRPDE), vous disposez des droits suivants :

• **Droit d'accès** : vous pouvez demander une copie des données personnelles que nous détenons sur vous.
• **Droit de rectification** : vous pouvez corriger vos informations depuis votre espace "Mon compte" ou en nous contactant.
• **Droit à l'effacement** : vous pouvez demander la suppression de votre compte et de vos données.
• **Droit d'opposition** : vous pouvez vous désabonner de la newsletter à tout moment via le lien en bas de chaque email.

Pour exercer ces droits, contactez-nous à support@mixmatchfrip.com.`,
  },
  {
    id: 'retention',
    title: '7. Conservation des données',
    content: `Nous conservons vos données aussi longtemps que nécessaire :

• **Données de compte actif** : conservées tant que votre compte est ouvert.
• **Historique de commandes** : conservé 5 ans à des fins comptables et légales.
• **Données de newsletter** : conservées jusqu'à désinscription.
• Après suppression de compte, vos données personnelles sont effacées dans un délai de 30 jours (sauf obligations légales contraires).`,
  },
  {
    id: 'contact',
    title: '8. Nous contacter',
    content: `Pour toute question relative à cette politique de confidentialité ou à vos données personnelles :

• **Email** : support@mixmatchfrip.com
• **Délai de réponse** : nous nous engageons à répondre à toute demande sous 5 jours ouvrables.

Cette politique est susceptible d'être mise à jour. En cas de modification substantielle, nous vous en informerons par email. La date de dernière mise à jour est indiquée en bas de cette page.`,
  },
]

export default function PolicyScreen() {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const renderContent = (text) =>
    text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />
      const formatted = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`)
      return <p key={i} className="policy-section__p" dangerouslySetInnerHTML={{ __html: formatted }} />
    })

  return (
    <div className="policy-page">
      <SEOHead
        title="Politique de confidentialité"
        description="Comment MixMatchFrip collecte, utilise et protège vos données personnelles. Conformité LPRPDE. Vos droits et comment nous contacter."
        url="/policy"
        noindex={true}
      />

      {/* Header */}
      <div className="policy-header">
        <div className="policy-header__inner">
          <p className="policy-header__tag">Légal</p>
          <h1 className="policy-header__title">Politique de confidentialité</h1>
          <p className="policy-header__sub">
            Chez MixMatchFrip, la protection de vos données personnelles est une priorité.
            Voici comment nous les collectons, utilisons et protégeons.
          </p>
          <p className="policy-header__date">Dernière mise à jour : avril 2026</p>
        </div>
      </div>

      {/* Body */}
      <div className="policy-body">
        <div className="policy-container">

          {/* Table of contents */}
          <aside className="policy-toc">
            <p className="policy-toc__title">Sommaire</p>
            <ul className="policy-toc__list">
              {SECTIONS.map(s => (
                <li key={s.id}>
                  <button className="policy-toc__link" onClick={() => scrollTo(s.id)}>
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content */}
          <main className="policy-content">
            {SECTIONS.map(s => (
              <section key={s.id} id={s.id} className="policy-section">
                <h2 className="policy-section__title">{s.title}</h2>
                <div className="policy-section__body">
                  {renderContent(s.content)}
                </div>
              </section>
            ))}

            <div className="policy-footer-note">
              <p>Des questions ? <Link to="/contact" className="policy-link">Contactez-nous</Link> — nous répondons sous 24h.</p>
            </div>
          </main>

        </div>
      </div>

    </div>
  )
}
