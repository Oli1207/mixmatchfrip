import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiInstance from '../../utils/axios'
import Swal from 'sweetalert2'
import logoImage from '../../assets/logo.jpeg'
import './login.css'

function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      Swal.fire({ icon: 'warning', title: t('auth.swal_error_title'), text: t('auth.swal_email_required'), position: 'center', confirmButtonText: t('common.ok') })
      return
    }
    setIsLoading(true)
    apiInstance.post('user/password-reset/', { email })
      .then(() => {
        Swal.fire({ icon: 'success', title: t('auth.swal_forgot_success'), text: t('auth.swal_forgot_text'), position: 'center', confirmButtonText: t('common.ok') })
        setEmail('')
      })
      .catch(() => {
        Swal.fire({ icon: 'error', title: t('auth.swal_error_title'), text: t('auth.swal_forgot_error'), position: 'center', confirmButtonText: t('common.ok') })
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logoImage} alt="Mix&Match Frip" />
      </div>
      <div className="login-box">
        <h2>{t('auth.forgot_title')}</h2>
        <p className="forgot-intro">{t('auth.forgot_intro')}</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="forgot-email" className="form-label">{t('auth.email_label')}</label>
            <input id="forgot-email" name="email" type="email" placeholder={t('auth.forgot_email_placeholder')}
              value={email} onChange={(e) => setEmail(e.target.value)} className="input-field"
              autoComplete="email" disabled={isLoading} />
          </div>
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? t('auth.sending') : t('auth.forgot_btn')}
          </button>
        </form>
        <div className="sign-up-prompt">
          <Link to="/login" className="forgot-back-link">{t('auth.back_to_login')}</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
