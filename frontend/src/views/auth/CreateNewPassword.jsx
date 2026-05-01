import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiInstance from '../../utils/axios'
import Swal from 'sweetalert2'
import logoImage from '../../assets/logo.jpeg'
import './login.css'

function CreateNewPassword() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [uidb64, setUidb64] = useState('')
  const [resetToken, setResetToken] = useState('')

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    setOtp(query.get('otp'))
    setUidb64(query.get('uidb64'))
    setResetToken(query.get('reset_token'))
  }, [location])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newPassword.trim()) {
      Swal.fire({ icon: 'warning', title: t('auth.swal_error_title'), text: t('auth.swal_password_required'), position: 'center', confirmButtonText: t('common.ok') })
      return
    }
    setIsLoading(true)
    apiInstance.post('user/password-reset-confirm/', { otp, uidb64, reset_token: resetToken, new_password: newPassword })
      .then((res) => {
        Swal.fire({ icon: 'success', title: t('auth.swal_forgot_success'), text: res.data?.message || t('auth.swal_forgot_text'), position: 'center', confirmButtonText: t('common.ok') })
        navigate('/login')
      })
      .catch((err) => {
        Swal.fire({ icon: 'error', title: t('auth.swal_error_title'), text: err.response?.data?.error || t('auth.swal_error_title'), position: 'center', confirmButtonText: t('common.ok') })
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logoImage} alt="Mix&Match Frip" />
      </div>
      <div className="login-box">
        <h2>{t('auth.new_password_title')}</h2>
        <p className="forgot-intro">{t('auth.new_password_intro')}</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="new-password" className="form-label">{t('auth.new_password_label')}</label>
            <input id="new-password" name="newPassword" type="password" placeholder={t('auth.new_password_label')}
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field"
              autoComplete="new-password" disabled={isLoading} />
          </div>
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? t('auth.sending') : t('auth.validate_btn')}
          </button>
        </form>
        <div className="sign-up-prompt">
          <Link to="/login" className="forgot-back-link">{t('auth.back_to_login')}</Link>
        </div>
      </div>
    </div>
  )
}

export default CreateNewPassword
