import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi'
import { ordersAPI } from '../../utils/api'
import { events as analyticsEvents } from '../../analytics/analytics'
import './PaymentSuccessScreen.css'

export default function PaymentSuccessScreen() {
  const { t }                      = useTranslation()
  const { order_number }           = useParams()
  const [searchParams]             = useSearchParams()
  const session_id                 = searchParams.get('session_id')

  const [status,  setStatus]  = useState('loading') // 'loading' | 'success' | 'error'
  const [order,   setOrder]   = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!session_id || !order_number) {
      setStatus('error')
      setMessage(t('payment.error_params'))
      return
    }

    ordersAPI.paymentSuccess(order_number, session_id)
      .then(({ data }) => {
        setOrder(data)
        setStatus('success')
        analyticsEvents.purchase(data.order_number, data.total, data.item_count ?? 1)
      })
      .catch(err => {
        const detail = err?.response?.data?.detail || t('payment.error_verification')
        setMessage(detail)
        setStatus('error')
      })
  }, [order_number, session_id])

  if (status === 'loading') {
    return (
      <div className="pay-result">
        <div className="pay-result__card">
          <div className="pay-result__spinner"><FiLoader size={32}/></div>
          <p>{t('payment.verifying')}</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="pay-result">
        <div className="pay-result__card">
          <div className="pay-result__icon pay-result__icon--error"><FiAlertCircle size={32}/></div>
          <h1 className="pay-result__title">{t('payment.error_title')}</h1>
          <p className="pay-result__text">{message}</p>
          <p className="pay-result__text" style={{ fontSize: 13 }}>
            {t('payment.error_ref').replace('#{order}', `#${order_number}`)}
          </p>
          <div className="pay-result__actions">
            <Link to="/" className="btn-dark-outline">{t('payment.back_home')}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pay-result">
      <div className="pay-result__card">
        <div className="pay-result__icon pay-result__icon--success"><FiCheck size={32}/></div>
        <h1 className="pay-result__title">{t('payment.success_title')}</h1>
        <p className="pay-result__text">
          {t('payment.success_text')
            .replace('#{order}', `#${order?.order_number}`)
            .replace('{email}', order?.email || '')}
        </p>

        {order && (
          <div className="pay-result__summary">
            <div className="pay-result__summary-row">
              <span>{t('payment.shipping_label')}</span>
              <span>{order.first_name} {order.last_name} — {order.city}</span>
            </div>
            <div className="pay-result__summary-row pay-result__summary-row--total">
              <span>{t('payment.total_paid')}</span>
              <span>{parseFloat(order.total).toFixed(2)} $</span>
            </div>
          </div>
        )}

        <div className="pay-result__actions">
          <Link to="/catalogue" className="btn-gold">{t('payment.continue_btn')}</Link>
        </div>
      </div>
    </div>
  )
}
