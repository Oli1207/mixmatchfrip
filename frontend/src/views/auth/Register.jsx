import React, { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { register } from '../../utils/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'
import logoImage from '../../assets/logo.jpeg'
import './login.css'

function Register() {
  const { t } = useTranslation()
  const [full_name, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  useEffect(() => {
    if (isLoggedIn()) navigate('/')
  }, [])

  const resetForm = () => {
    setFullname(''); setEmail(''); setMobile(''); setPassword(''); setPassword2('')
    setAcceptPrivacy(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!acceptPrivacy) {
      Swal.fire({ icon: 'warning', title: t('auth.swal_privacy_required'), text: t('auth.swal_privacy_text'), position: 'center', confirmButtonText: t('common.ok') })
      return
    }
    setIsLoading(true)
    const { error } = await register(full_name, email, phone, password, password2)
    if (error) {
      Swal.fire({ icon: 'error', title: t('auth.swal_error_title'), text: error, position: 'center', confirmButtonText: t('common.ok') })
      setIsLoading(false)
    } else {
      Swal.fire({ icon: 'success', title: t('auth.swal_register_success'), text: t('auth.swal_register_text'), position: 'center', confirmButtonText: t('common.ok') })
      navigate('/')
      setIsLoading(false)
      resetForm()
    }
  }

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logoImage} alt="Mix&Match Frip" />
      </div>
      <div className="login-box">
        <h2>{t('auth.register_title')}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="full_name" className="form-label">{t('auth.full_name_label')}</label>
            <input type="text" id="full_name" placeholder={t('auth.full_name_label')}
              value={full_name} onChange={(e) => setFullname(e.target.value)} className="input-field" />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">{t('auth.email_label')}</label>
            <input type="email" id="email" placeholder={t('auth.email_label')}
              value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="form-label">{t('auth.phone_label')}</label>
            <input type="number" id="phone" placeholder={t('auth.phone_label')}
              value={phone} onChange={(e) => setMobile(e.target.value)} className="input-field" />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">{t('auth.password_label')}</label>
            <input type="password" id="password" placeholder={t('auth.password_label')}
              value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
          </div>
          <div className="form-group">
            <label htmlFor="password2" className="form-label">{t('auth.password2_label')}</label>
            <input type="password" id="password2" placeholder={t('auth.password2_label')}
              value={password2} onChange={(e) => setPassword2(e.target.value)} className="input-field" />
          </div>

          <div className="form-group" style={{ marginTop: 6 }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="checkbox" checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)} style={{ marginTop: 3 }} />
              <span style={{ fontSize: 13, lineHeight: 1.4 }}>
                {t('auth.privacy_consent')}{' '}
                <button type="button" onClick={() => setShowPrivacy(true)}
                  style={{ border: 'none', background: 'transparent', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>
                  {t('auth.privacy_link')}
                </button>.
              </span>
            </label>
          </div>

          <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.4, opacity: 0.9 }}>
            <strong>{t('auth.payment_security')}</strong>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? t('auth.loading') : t('auth.register_btn')}
          </button>
        </form>

        <div className="sign-up-prompt">
          {t('auth.already_account')} <Link to="/login">{t('auth.login_link')}</Link>
        </div>
      </div>

      {showPrivacy && (
        <div role="dialog" aria-modal="true" onClick={() => setShowPrivacy(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 720, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontWeight: 800 }}>{t('auth.privacy_title')}</div>
              <button type="button" onClick={() => setShowPrivacy(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                aria-label={t('common.close')} title={t('common.close')}>
                <FiX size={18} />
              </button>
            </div>
            <div style={{ padding: 16, maxHeight: '70vh', overflowY: 'auto', lineHeight: 1.5, fontSize: 14 }}>
              <p style={{ marginTop: 0 }}>
                <strong>Politique de Confidentialité & de Sécurité — Mix&Match Frip</strong><br />
                <span style={{ opacity: 0.8 }}>Dernière mise à jour : avril 2026</span>
              </p>
              <p>Mix&Match Frip collecte et utilise certaines informations (nom, email, téléphone, commandes, données techniques) afin de fournir le service, sécuriser la plateforme, traiter les paiements et vous assister en cas de problème. Ces données ne sont jamais revendues à des tiers.</p>
              <p><strong>Paiements (Stripe)</strong> : les paiements sont traités de manière sécurisée via Stripe. Mix&Match Frip ne stocke pas vos informations de carte bancaire.</p>
              <p><strong>Commandes & retours</strong> : en cas de non-conformité avérée, un retour ou remboursement peut être accordé dans les 48h suivant la réception.</p>
              <p><strong>Livraison</strong> : les frais et délais de livraison sont calculés via Chit Chats et affichés avant la validation de la commande.</p>
              <p><strong>Vos droits</strong> : vous pouvez demander l'accès, la rectification ou la suppression de vos données : <strong>support@mixmatchfrip.com</strong>.</p>
            </div>
            <div style={{ padding: 16, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowPrivacy(false)}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                {t('common.close')}
              </button>
              <button type="button" onClick={() => { setAcceptPrivacy(true); setShowPrivacy(false) }}
                style={{ padding: '10px 12px', borderRadius: 10, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontWeight: 800 }}>
                {t('auth.privacy_accept')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register
