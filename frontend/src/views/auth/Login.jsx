import React, { useState, useEffect } from 'react'
import { login } from '../../utils/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'
import logoImage from '../../assets/logo.jpeg'
import './login.css'

function Login() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  useEffect(() => {
    if (isLoggedIn()) navigate('/')
  }, [])

  const resetForm = () => { setEmail(''); setPassword('') }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await login(email, password)
    if (error) {
      Swal.fire({ icon: 'error', title: t('auth.swal_error_title'), text: t('auth.swal_error_credentials'), position: 'center', confirmButtonText: t('common.ok') })
      setIsLoading(false)
    } else {
      Swal.fire({ icon: 'success', title: t('auth.swal_success_login'), text: t('auth.swal_welcome'), position: 'center', confirmButtonText: t('common.ok') })
      navigate('/')
      resetForm()
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logoImage} alt="Mix&Match Frip" />
      </div>
      <div className="login-box">
        <h2>{t('auth.login_title')}</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">{t('auth.email_label')}</label>
            <input type="text" name="email" id="email" placeholder={t('auth.email_label')}
              value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">{t('auth.password_label')}</label>
            <input type="password" name="password" id="password" placeholder={t('auth.password_label')}
              value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
          </div>
          <div style={{ width: '100%', textAlign: 'right', marginBottom: '10px' }}>
            <Link to="/forgot-password" className="forgot-password">{t('auth.forgot_password')}</Link>
          </div>
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? t('auth.loading') : t('auth.login_btn')}
          </button>
        </form>
        <div className="sign-up-prompt">
          {t('auth.no_account')}{' '}
          <Link to="/register">{t('auth.create_account')}</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
