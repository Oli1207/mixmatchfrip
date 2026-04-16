import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi'
import { ordersAPI } from '../../utils/api'
import './PaymentSuccessScreen.css'

export default function PaymentSuccessScreen() {
  const { order_number }          = useParams()
  const [searchParams]            = useSearchParams()
  const session_id                = searchParams.get('session_id')

  const [status,  setStatus]  = useState('loading') // 'loading' | 'success' | 'error'
  const [order,   setOrder]   = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!session_id || !order_number) {
      setStatus('error')
      setMessage('Paramètres manquants.')
      return
    }

    ordersAPI.paymentSuccess(order_number, session_id)
      .then(({ data }) => {
        setOrder(data)
        setStatus('success')
      })
      .catch(err => {
        const detail = err?.response?.data?.detail || 'Erreur lors de la vérification du paiement.'
        setMessage(detail)
        setStatus('error')
      })
  }, [order_number, session_id])

  if (status === 'loading') {
    return (
      <div className="pay-result">
        <div className="pay-result__card">
          <div className="pay-result__spinner"><FiLoader size={32}/></div>
          <p>Vérification du paiement…</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="pay-result">
        <div className="pay-result__card">
          <div className="pay-result__icon pay-result__icon--error"><FiAlertCircle size={32}/></div>
          <h1 className="pay-result__title">Une erreur est survenue</h1>
          <p className="pay-result__text">{message}</p>
          <p className="pay-result__text" style={{ fontSize: 13 }}>
            Si vous avez été débité, conservez votre référence de commande
            <strong> #{order_number}</strong> et contactez-nous.
          </p>
          <div className="pay-result__actions">
            <Link to="/" className="btn-dark-outline">Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pay-result">
      <div className="pay-result__card">
        <div className="pay-result__icon pay-result__icon--success"><FiCheck size={32}/></div>
        <h1 className="pay-result__title">Commande confirmée !</h1>
        <p className="pay-result__text">
          Merci pour votre achat. Votre commande
          <strong> #{order?.order_number}</strong> a bien été reçue et votre
          paiement est confirmé. Un email de confirmation a été envoyé à
          <strong> {order?.email}</strong>.
        </p>

        {order && (
          <div className="pay-result__summary">
            <div className="pay-result__summary-row">
              <span>Livraison</span>
              <span>{order.first_name} {order.last_name} — {order.city}</span>
            </div>
            <div className="pay-result__summary-row pay-result__summary-row--total">
              <span>Total payé</span>
              <span>{parseFloat(order.total).toFixed(2)} $</span>
            </div>
          </div>
        )}

        <div className="pay-result__actions">
          <Link to="/catalogue" className="btn-gold">Continuer les achats</Link>
        </div>
      </div>
    </div>
  )
}
