import { useState } from 'react'
import { FiMail, FiInstagram, FiMapPin, FiSend, FiCheck } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './ContactScreen.css'
import SEOHead from '../../components/SEOHead'

const CHANNELS = [
  {
    Icon: FiMail,
    title: 'Email',
    desc: 'Pour toute question sur vos commandes ou nos articles.',
    value: 'support@mixmatchfrip.com',
    href: 'mailto:support@mixmatchfrip.com',
  },
  {
    Icon: FiInstagram,
    title: 'Instagram',
    desc: 'Suivez nos nouveautés et envoyez-nous un DM.',
    value: '@mixmatch_frip',
    href: 'https://www.instagram.com/mixmatch_frip',
  },
  {
    Icon: FiMapPin,
    title: 'Localisation',
    desc: 'Boutique en ligne · Livraison partout au Canada.',
    value: 'Montréal, Québec',
    href: null,
  },
]

const SUBJECTS = [
  'Ma commande',
  'Un article / retour',
  'Mon compte',
  'Vendre mes vêtements',
  'Partenariat / presse',
  'Autre',
]

export default function ContactScreen() {
  const [form, setForm]       = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Votre nom est requis.'
    if (!form.email.trim())   e.email   = 'Votre email est requis.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide.'
    if (!form.message.trim()) e.message = 'Votre message est requis.'
    return e
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) { setErrors(v); return }
    setLoading(true)
    // Ouvre le client mail avec les infos pré-remplies
    const body = encodeURIComponent(
      `Bonjour,\n\n${form.message}\n\n---\nNom : ${form.name}\nSujet : ${form.subject}`
    )
    window.location.href = `mailto:support@mixmatchfrip.com?subject=${encodeURIComponent(`[MixMatchFrip] ${form.subject}`)}&body=${body}`
    setTimeout(() => { setLoading(false); setSent(true) }, 600)
  }

  return (
    <div className="contact-page">
      <SEOHead
        title="Nous contacter"
        description="Contactez l'équipe MixMatchFrip pour toute question sur vos commandes, un article ou un retour. Réponse sous 24h."
        url="/contact"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contacter MixMatchFrip',
          url: 'https://mixmatchfrip.com/contact',
        }}
      />

      {/* Header */}
      <div className="contact-header">
        <div className="contact-header__inner">
          <p className="contact-header__tag">Support</p>
          <h1 className="contact-header__title">Nous contacter</h1>
          <p className="contact-header__sub">
            Une question, un problème ou une suggestion ? On vous répond sous 24h.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="contact-body">
        <div className="contact-container">

          {/* Channels */}
          <div className="contact-channels">
            {CHANNELS.map(ch => (
              <div key={ch.title} className="contact-channel">
                <span className="contact-channel__icon"><ch.Icon size={20} /></span>
                <div>
                  <p className="contact-channel__title">{ch.title}</p>
                  <p className="contact-channel__desc">{ch.desc}</p>
                  {ch.href
                    ? <a href={ch.href} className="contact-channel__link" target={ch.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{ch.value}</a>
                    : <span className="contact-channel__link contact-channel__link--static">{ch.value}</span>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="contact-form-wrap">
            {sent ? (
              <div className="contact-success">
                <span className="contact-success__icon"><FiCheck size={28} /></span>
                <h2 className="contact-success__title">Message préparé !</h2>
                <p className="contact-success__text">
                  Votre client mail s'est ouvert avec votre message. Envoyez-le et nous vous répondrons sous 24h.
                </p>
                <button className="contact-success__reset" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }) }}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <h2 className="contact-form__title">Envoyer un message</h2>

                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label className="contact-form__label">Votre nom</label>
                    <input
                      className={`contact-form__input ${errors.name ? 'contact-form__input--err' : ''}`}
                      type="text"
                      name="name"
                      placeholder="Marie Tremblay"
                      value={form.name}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="contact-form__error">{errors.name}</p>}
                  </div>
                  <div className="contact-form__group">
                    <label className="contact-form__label">Votre email</label>
                    <input
                      className={`contact-form__input ${errors.email ? 'contact-form__input--err' : ''}`}
                      type="email"
                      name="email"
                      placeholder="marie@email.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <p className="contact-form__error">{errors.email}</p>}
                  </div>
                </div>

                <div className="contact-form__group">
                  <label className="contact-form__label">Sujet</label>
                  <select className="contact-form__select" name="subject" value={form.subject} onChange={handleChange}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="contact-form__group">
                  <label className="contact-form__label">Message</label>
                  <textarea
                    className={`contact-form__textarea ${errors.message ? 'contact-form__input--err' : ''}`}
                    name="message"
                    rows={5}
                    placeholder="Décrivez votre question ou situation..."
                    value={form.message}
                    onChange={handleChange}
                  />
                  {errors.message && <p className="contact-form__error">{errors.message}</p>}
                </div>

                <button className="contact-form__btn" type="submit" disabled={loading}>
                  <FiSend size={15} />
                  {loading ? 'Préparation...' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* FAQ CTA */}
      <div className="contact-faq-cta">
        <p className="contact-faq-cta__text">
          Vous cherchez une réponse rapide ?
        </p>
        <Link to="/faq" className="contact-faq-cta__link">Consulter la FAQ →</Link>
      </div>

    </div>
  )
}
