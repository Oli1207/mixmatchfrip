import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiXCircle } from 'react-icons/fi'
import './PaymentSuccessScreen.css' // même styles de base

export default function PaymentFailedScreen() {
  const { t }            = useTranslation()
  const { order_number } = useParams()

  return (
    <div className="pay-result">
      <div className="pay-result__card">
        <div className="pay-result__icon pay-result__icon--error">
          <FiXCircle size={32}/>
        </div>
        <h1 className="pay-result__title">{t('payment.cancelled_title')}</h1>
        <p className="pay-result__text">
          {t('payment.cancelled_text').replace('#{order}', `#${order_number}`)}
        </p>
        <p className="pay-result__text" style={{ fontSize: 13 }}>
          {t('payment.cancelled_sub')}
        </p>
        <div className="pay-result__actions">
          <Link to="/checkout" className="btn-gold">{t('payment.retry_payment')}</Link>
          <Link to="/catalogue" className="btn-dark-outline">{t('payment.back_to_shop')}</Link>
        </div>
      </div>
    </div>
  )
}
