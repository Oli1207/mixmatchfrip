import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiMail, FiInstagram, FiMapPin, FiSend, FiCheck } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './ContactScreen.css'
import SEOHead from '../../components/SEOHead'

export default function ContactScreen() {
  const { t } = useTranslation()

  const CHANNELS = [
    {
      Icon: FiMail,
      title: t('contact.channel_email'),
      desc: t('contact.email_desc_full'),
      value: 'support@mixmatchfrip.com',
      href: 'mailto:support@mixmatchfrip.com',
    },
    {
      Icon: FiInstagram,
      title: t('contact.channel_instagram'),
      desc: t('contact.instagram_desc_full'),
      value: '@mixmatch_frip',
      href: 'https://www.instagram.com/mixmatch_frip',
    },
    {
      Icon: FiMapPin,
      title: t('contact.channel_location'),
      desc: t('contact.location_desc_full'),
      value: t('contact.location_value'),
      href: null,
    },
  ]

  const SUBJECTS = [
    t('contact.subject_my_order'),
    t('contact.subject_item_return'),
    t('contact.subject_my_account'),
    t('contact.subject_sell'),
    t('contact.subject_press'),
    t('contact.subject_other_item'),
  ]

  const [form, setForm]       = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = t('contact.validate_name')
    if (!form.email.trim())   e.email   = t('contact.validate_email_required')
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('contact.validate_email_invalid')
    if (!form.message.trim()) e.message = t('contact.validate_message')
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
      `${form.message}\n\n---\n${form.name} / ${form.subject}`
    )
    window.location.href = `mailto:support@mixmatchfrip.com?subject=${encodeURIComponent(`[MixMatchFrip] ${form.subject}`)}&body=${body}`
    setTimeout(() => { setLoading(false); setSent(true) }, 600)
  }

  return (
    <div className="contact-page">
      <SEOHead
        title={t('contact.title')}
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
          <p className="contact-header__tag">{t('contact.support_tag')}</p>
          <h1 className="contact-header__title">{t('contact.title')}</h1>
          <p className="contact-header__sub">{t('contact.response_24h')}</p>
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
                <h2 className="contact-success__title">{t('contact.success_prepared')}</h2>
                <p className="contact-success__text">{t('contact.success_mail_text')}</p>
                <button className="contact-success__reset" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }) }}>
                  {t('contact.send_another')}
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <h2 className="contact-form__title">{t('contact.form_title')}</h2>

                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label className="contact-form__label">{t('contact.field_name')}</label>
                    <input
                      className={`contact-form__input ${errors.name ? 'contact-form__input--err' : ''}`}
                      type="text"
                      name="name"
                      placeholder={t('contact.name_placeholder')}
                      value={form.name}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="contact-form__error">{errors.name}</p>}
                  </div>
                  <div className="contact-form__group">
                    <label className="contact-form__label">{t('contact.field_email')}</label>
                    <input
                      className={`contact-form__input ${errors.email ? 'contact-form__input--err' : ''}`}
                      type="email"
                      name="email"
                      placeholder={t('contact.email_placeholder')}
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <p className="contact-form__error">{errors.email}</p>}
                  </div>
                </div>

                <div className="contact-form__group">
                  <label className="contact-form__label">{t('contact.field_subject')}</label>
                  <select className="contact-form__select" name="subject" value={form.subject} onChange={handleChange}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="contact-form__group">
                  <label className="contact-form__label">{t('contact.field_message')}</label>
                  <textarea
                    className={`contact-form__textarea ${errors.message ? 'contact-form__input--err' : ''}`}
                    name="message"
                    rows={5}
                    placeholder={t('contact.message_placeholder')}
                    value={form.message}
                    onChange={handleChange}
                  />
                  {errors.message && <p className="contact-form__error">{errors.message}</p>}
                </div>

                <button className="contact-form__btn" type="submit" disabled={loading}>
                  <FiSend size={15} />
                  {loading ? t('contact.preparing') : t('contact.send_btn')}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* FAQ CTA */}
      <div className="contact-faq-cta">
        <p className="contact-faq-cta__text">{t('contact.faq_quick')}</p>
        <Link to="/faq" className="contact-faq-cta__link">{t('contact.faq_cta_link')}</Link>
      </div>

    </div>
  )
}
