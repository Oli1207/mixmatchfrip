import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiX, FiCheck, FiCopy } from 'react-icons/fi'
import { newsletterAPI } from '../../utils/api'
import './WelcomePopup.css'

const POPUP_KEY  = 'mmf_welcome_seen'
const PROMO_CODE = 'BIENVENUE15'

export default function WelcomePopup() {
  const { t } = useTranslation()

  const [visible,    setVisible]    = useState(false)
  const [firstName,  setFirstName]  = useState('')
  const [email,      setEmail]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)
  const [copied,     setCopied]     = useState(false)

  useEffect(() => {
    if (localStorage.getItem(POPUP_KEY)) return
    const timer = setTimeout(() => setVisible(true), 2200)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setVisible(false)
    localStorage.setItem(POPUP_KEY, '1')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimEmail = email.trim()
    if (!trimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
      setError(t('popup.error_email'))
      return
    }
    setLoading(true)
    try {
      await newsletterAPI.subscribe(trimEmail.toLowerCase(), firstName.trim(), 'popup_promo')
      setSuccess(true)
      localStorage.setItem(POPUP_KEY, '1')
    } catch {
      // already subscribed → show code anyway
      setSuccess(true)
      localStorage.setItem(POPUP_KEY, '1')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(PROMO_CODE).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!visible) return null

  return (
    <div className="wp-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="wp-modal" onClick={e => e.stopPropagation()}>

        <button className="wp-close" onClick={handleClose} aria-label={t('popup.close')}>
          <FiX size={18} />
        </button>

        {!success ? (
          <>
            {/* Badge */}
            <div className="wp-badge">✦ Mix&Match Frip</div>

            <h2 className="wp-title">
              {t('popup.title').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p className="wp-sub">{t('popup.subtitle')}</p>

            <form className="wp-form" onSubmit={handleSubmit} noValidate>
              <input
                type="text"
                className="wp-input"
                placeholder={t('popup.first_name_placeholder')}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
              <input
                type="email"
                className="wp-input"
                placeholder={t('popup.email_placeholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              {error && <p className="wp-error">{error}</p>}
              <button type="submit" className="wp-cta" disabled={loading}>
                {loading ? '…' : t('popup.cta')}
              </button>
            </form>

            <p className="wp-legal">{t('popup.legal')}</p>
          </>
        ) : (
          <div className="wp-success">
            <div className="wp-success__icon">
              <FiCheck size={26} />
            </div>
            <h2 className="wp-success__title">
              {firstName
                ? `${firstName.charAt(0).toUpperCase() + firstName.slice(1)}, ${t('popup.success_title_name')}`
                : t('popup.success_title')}
            </h2>
            <p className="wp-success__text">{t('popup.success_text')}</p>

            <button className="wp-code" onClick={handleCopy} title="Copier le code">
              <span className="wp-code__value">{PROMO_CODE}</span>
              <span className="wp-code__icon">
                {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
              </span>
            </button>

            <p className="wp-success__hint">{t('popup.success_hint')}</p>

            <Link to="/catalogue" className="wp-cta wp-cta--success" onClick={handleClose}>
              {t('popup.success_cta')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
