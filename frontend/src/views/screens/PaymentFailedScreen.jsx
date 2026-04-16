import { useParams, Link } from 'react-router-dom'
import { FiXCircle } from 'react-icons/fi'
import './PaymentSuccessScreen.css' // même styles de base

export default function PaymentFailedScreen() {
  const { order_number } = useParams()

  return (
    <div className="pay-result">
      <div className="pay-result__card">
        <div className="pay-result__icon pay-result__icon--error">
          <FiXCircle size={32}/>
        </div>
        <h1 className="pay-result__title">Paiement annulé</h1>
        <p className="pay-result__text">
          Votre paiement a été annulé. Votre commande
          <strong> #{order_number}</strong> est en attente — aucun montant n'a été débité.
        </p>
        <p className="pay-result__text" style={{ fontSize: 13 }}>
          Vous pouvez réessayer de payer ou retourner à la boutique.
        </p>
        <div className="pay-result__actions">
          <Link to="/checkout" className="btn-gold">Réessayer le paiement</Link>
          <Link to="/catalogue" className="btn-dark-outline">Retour à la boutique</Link>
        </div>
      </div>
    </div>
  )
}
