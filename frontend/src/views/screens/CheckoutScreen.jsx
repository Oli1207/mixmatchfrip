import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiChevronDown, FiChevronUp, FiCheck, FiLock, FiAlertCircle, FiTag, FiX } from 'react-icons/fi'
import useCartStore from '../../store/cart'
import useAuthStore from '../../store/auth'
import { ordersAPI, shippingAPI } from '../../utils/api'
import apiInstance from '../../utils/axios'
import { formatPrice } from '../../utils/currency'
import './CheckoutScreen.css'

const STEPS = ['Livraison', 'Paiement', 'Confirmation']

const PROVINCES = [
  'Alberta', 'Colombie-Britannique', 'Manitoba', 'Nouveau-Brunswick',
  'Nouvelle-Écosse', 'Ontario', 'Québec', 'Saskatchewan',
  'Terre-Neuve-et-Labrador', 'Île-du-Prince-Édouard', 'Nouvelle-Écosse',
  'Territoires du Nord-Ouest', 'Nunavut', 'Yukon',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={label} className="step-indicator__item">
            <div className={`step-indicator__circle ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
              {done ? <FiCheck size={14}/> : <span>{i + 1}</span>}
            </div>
            <span className={`step-indicator__label ${active ? 'active' : ''}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`step-indicator__line ${done ? 'done' : ''}`}/>}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, id, error, children }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      {children}
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}

// ─── Step 1 : Livraison ───────────────────────────────────────────────────────

function ShippingStep({ form, errors, onChange, rates, ratesLoading, ratesError, selectedRate, onSelectRate }) {
  return (
    <div className="checkout-step">
      <h2 className="checkout-step__title">Adresse de livraison</h2>
      <div className="form-row">
        <Field label="Prénom *" id="first_name" error={errors.first_name}>
          <input id="first_name" className={`input ${errors.first_name ? 'input--error' : ''}`}
            name="first_name" value={form.first_name} onChange={onChange} placeholder="Marie"/>
        </Field>
        <Field label="Nom *" id="last_name" error={errors.last_name}>
          <input id="last_name" className={`input ${errors.last_name ? 'input--error' : ''}`}
            name="last_name" value={form.last_name} onChange={onChange} placeholder="Dupont"/>
        </Field>
      </div>
      <Field label="Email *" id="email" error={errors.email}>
        <input id="email" className={`input ${errors.email ? 'input--error' : ''}`}
          name="email" value={form.email} onChange={onChange} placeholder="marie@exemple.ca" type="email"/>
      </Field>
      <Field label="Adresse *" id="address" error={errors.address}>
        <input id="address" className={`input ${errors.address ? 'input--error' : ''}`}
          name="address" value={form.address} onChange={onChange} placeholder="123 rue Sainte-Catherine"/>
      </Field>
      <div className="form-row">
        <Field label="Ville *" id="city" error={errors.city}>
          <input id="city" className={`input ${errors.city ? 'input--error' : ''}`}
            name="city" value={form.city} onChange={onChange} placeholder="Montréal"/>
        </Field>
        <Field label="Province *" id="province" error={errors.province}>
          <div className="select-wrap">
            <select id="province" className={`input select ${errors.province ? 'input--error' : ''}`}
              name="province" value={form.province} onChange={onChange}>
              <option value="">Choisir…</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <FiChevronDown className="select-icon" size={16}/>
          </div>
        </Field>
      </div>
      <div className="form-row form-row--narrow">
        <Field label="Code postal *" id="postal_code" error={errors.postal_code}>
          <input id="postal_code" className={`input ${errors.postal_code ? 'input--error' : ''}`}
            name="postal_code" value={form.postal_code} onChange={onChange} placeholder="H2X 1Y6"/>
        </Field>
        <Field label="Téléphone *" id="phone" error={errors.phone}>
          <input id="phone" className={`input ${errors.phone ? 'input--error' : ''}`}
            name="phone" value={form.phone} onChange={onChange} placeholder="+1 514 000 0000" type="tel"/>
        </Field>
      </div>

      {/* Options de livraison Canada Post */}
      <Field label="Mode de livraison *" id="shipping_method" error={errors.shipping_method}>
        <div className="shipping-options">
          {ratesLoading ? (
            <div className="shipping-options__loading">Calcul des frais de port via Chit Chats…</div>
          ) : ratesError ? (
            <div className="shipping-options__hint shipping-options__hint--error">
              <FiAlertCircle size={14}/>
              {ratesError}
            </div>
          ) : rates.length === 0 ? (
            <div className="shipping-options__hint">
              <FiAlertCircle size={14}/>
              Entrez votre code postal pour voir les options de livraison.
            </div>
          ) : (
            rates.map(rate => (
              <label
                key={rate.code}
                className={`shipping-option${selectedRate?.code === rate.code ? ' selected' : ''}`}
              >
                <input
                  type="radio"
                  name="shipping_method"
                  value={rate.code}
                  checked={selectedRate?.code === rate.code}
                  onChange={() => onSelectRate(rate)}
                />
                <div className="shipping-option__info">
                  <span className="shipping-option__name">{rate.name}</span>
                  {rate.days && rate.code !== 'pickup' && (
                    <span className="shipping-option__days">{rate.days} jour{rate.days !== '1' ? 's' : ''} ouvrable{rate.days !== '1' ? 's' : ''}</span>
                  )}
                </div>
                <span className="shipping-option__price">
                  {rate.price > 0 ? formatPrice(rate.price) : 'Gratuit'}
                </span>
              </label>
            ))
          )}
        </div>
      </Field>

      <Field label="Instructions de livraison (optionnel)" id="instructions">
        <textarea id="instructions" className="input textarea"
          name="instructions" value={form.instructions} onChange={onChange}
          placeholder="Ex: code d'accès, appartement…" rows={3}/>
      </Field>
    </div>
  )
}

// ─── Step 2 : Paiement ────────────────────────────────────────────────────────

function PaymentStep({ form, shippingCost, cart, discount, promoCode, onPay, paying, payError }) {
  const subtotal = parseFloat(cart?.subtotal || 0)
  const total    = Math.max(0, subtotal - discount + shippingCost).toFixed(2)

  return (
    <div className="checkout-step">
      <h2 className="checkout-step__title">Paiement</h2>

      <div className="payment-summary">
        <div className="payment-summary__row">
          <span>Livraison à</span>
          <span>{form.first_name} {form.last_name} &mdash; {form.city}</span>
        </div>
        <div className="payment-summary__row">
          <span>Sous-total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="payment-summary__row payment-summary__row--discount">
            <span>Remise ({promoCode})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="payment-summary__row">
          <span>Frais de port</span>
          <span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Gratuit'}</span>
        </div>
        <div className="payment-summary__row payment-summary__row--total">
          <span>Total à payer</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="payment-notice">
        <FiLock size={14}/>
        <span>
          Paiement securise via <strong>Paystack</strong>. Vos donnees bancaires ne
          transitent jamais par nos serveurs.
        </span>
      </div>

      <div className="payment-logos">
        <span>Visa</span>
        <span>Mastercard</span>
        <span>Amex</span>
      </div>

      {payError && (
        <div className="checkout-api-error" style={{ marginBottom: 16 }}>
          {payError}
        </div>
      )}

      <button
        className="btn-gold pay-btn"
        onClick={onPay}
        disabled={paying}
      >
        {paying ? 'Traitement...' : `Payer ${formatPrice(total)} avec Paystack`}
      </button>
    </div>
  )
}

// ─── Step 3 : Confirmation ────────────────────────────────────────────────────

function ConfirmationStep({ order }) {
  const navigate = useNavigate()
  return (
    <div className="checkout-confirm">
      <div className="checkout-confirm__icon"><FiCheck size={28}/></div>
      <h2 className="checkout-confirm__title">Commande confirmée !</h2>
      <p className="checkout-confirm__text">
        Merci pour votre achat. Votre commande <strong>#{order?.order_number}</strong> a bien
        été reçue et votre paiement est confirmé. Un courriel de confirmation vous a été envoyé
        à <strong>{order?.email}</strong>.
      </p>
      <div className="checkout-confirm__actions">
        <button className="btn-gold" onClick={() => navigate('/catalogue')}>
          Continuer les achats
        </button>
        <button className="btn-dark-outline" onClick={() => navigate('/orders')}>
          Voir mes commandes
        </button>
      </div>
    </div>
  )
}

// ─── Promo Code widget ────────────────────────────────────────────────────────

function PromoWidget({ onApply, onRemove, promoCode, discount, promoError, promoLoading }) {
  const [input, setInput] = useState('')

  const handleApply = () => {
    if (input.trim()) onApply(input.trim().toUpperCase())
  }

  if (promoCode) {
    return (
      <div className="promo-widget promo-widget--applied">
        <FiTag size={14}/>
        <span className="promo-widget__code">{promoCode}</span>
        <span className="promo-widget__saving">-{formatPrice(discount)}</span>
        <button className="promo-widget__remove" onClick={onRemove} title="Retirer">
          <FiX size={14}/>
        </button>
      </div>
    )
  }

  return (
    <div className="promo-widget">
      <div className="promo-widget__row">
        <input
          className="input promo-widget__input"
          placeholder="Code promo"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          maxLength={50}
        />
        <button
          className="promo-widget__btn"
          onClick={handleApply}
          disabled={promoLoading || !input.trim()}
        >
          {promoLoading ? '...' : 'Appliquer'}
        </button>
      </div>
      {promoError && <p className="promo-widget__error">{promoError}</p>}
    </div>
  )
}

// ─── Order Summary sidebar ────────────────────────────────────────────────────

function OrderSummary({ cart, shippingCost, discount, promoCode, promoError, promoLoading, onApplyPromo, onRemovePromo }) {
  const [open, setOpen] = useState(false)
  if (!cart) return null
  const subtotal = parseFloat(cart.subtotal)
  const total    = Math.max(0, subtotal - discount + shippingCost).toFixed(2)

  return (
    <div className="order-summary">
      <button className="order-summary__toggle" onClick={() => setOpen(o => !o)}>
        <span>Resume de la commande ({cart.item_count})</span>
        {open ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}
      </button>
      {open && (
        <div className="order-summary__items">
          {cart.items.map(item => (
            <div key={item.id} className="order-summary__item">
              <div className="order-summary__img-wrap">
                <img
                  src={item.product.main_image_url || 'https://via.placeholder.com/48x60'}
                  alt={item.product.name}
                />
                <span className="order-summary__qty">{item.qty}</span>
              </div>
              <div className="order-summary__info">
                <p className="order-summary__brand">{item.product.brand}</p>
                <p className="order-summary__name">{item.product.name}</p>
              </div>
              <span className="order-summary__price">{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="order-summary__rows">
        <div className="order-summary__row"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
        {discount > 0 && (
          <div className="order-summary__row order-summary__row--discount">
            <span>Remise ({promoCode})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="order-summary__row">
          <span>Livraison</span>
          <span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Gratuit'}</span>
        </div>
        <div className="order-summary__total"><span>Total</span><span>{formatPrice(total)}</span></div>
      </div>

      <div className="order-summary__promo">
        <PromoWidget
          onApply={onApplyPromo}
          onRemove={onRemovePromo}
          promoCode={promoCode}
          discount={discount}
          promoError={promoError}
          promoLoading={promoLoading}
        />
      </div>
    </div>
  )
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateShipping(form, selectedRate) {
  const e = {}
  if (!form.first_name.trim()) e.first_name = 'Requis'
  if (!form.last_name.trim())  e.last_name  = 'Requis'
  if (!form.email.trim())      e.email      = 'Requis'
  if (!form.address.trim())    e.address    = 'Requis'
  if (!form.city.trim())       e.city       = 'Requis'
  if (!form.province)          e.province   = 'Requis'
  if (!form.postal_code.trim()) e.postal_code = 'Requis'
  if (!form.phone.trim())      e.phone      = 'Requis'
  if (!selectedRate)           e.shipping_method = 'Choisissez un mode de livraison'
  return e
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CheckoutScreen() {
  const navigate                  = useNavigate()
  const { isLoggedIn, allUserData } = useAuthStore()
  const { cart, fetchCart, clearCart } = useCartStore()

  const [step,         setStep]        = useState(0)
  const [errors,       setErrors]      = useState({})
  const [apiError,     setApiError]    = useState(null)
  const [order,        setOrder]       = useState(null)

  // Shipping rates state
  const [rates,        setRates]       = useState([])
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesError,   setRatesError]  = useState(null)
  const [selectedRate, setSelectedRate] = useState(null)
  const ratesTimer = useRef(null)

  // Payment state
  const [paying,       setPaying]      = useState(false)
  const [payError,     setPayError]    = useState(null)

  // Promo code state
  const [promoCode,    setPromoCode]   = useState('')
  const [discount,     setDiscount]    = useState(0)
  const [promoError,   setPromoError]  = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)

  const [form, setForm] = useState({
    first_name:   '',
    last_name:    '',
    email:        allUserData?.email || '',
    phone:        allUserData?.phone || '',
    address:      '',
    city:         '',
    province:     '',
    postal_code:  '',
    instructions: '',
  })

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    fetchCart()
  }, [])

  // Fetch Canada Post rates when postal code changes (debounced 600ms)
  useEffect(() => {
    const postal = form.postal_code.replace(' ', '')
    if (postal.length < 6) {
      setRates([])
      setSelectedRate(null)
      return
    }
    clearTimeout(ratesTimer.current)
    ratesTimer.current = setTimeout(async () => {
      setRatesLoading(true)
      setRatesError(null)
      // Poids total depuis les articles du panier (weight_g par produit × quantite)
      const weightG = cart?.items?.reduce((sum, item) => {
        return sum + (item.product.weight_g || 400) * item.qty
      }, 0) || 500
      try {
        const { data } = await shippingAPI.getRates(postal, weightG)
        setRates(data)
        // Auto-select la premiere option non-retrait
        const first = data.find(r => r.code !== 'pickup') || data[0]
        setSelectedRate(first || null)
      } catch (err) {
        const msg = err?.response?.data?.detail || 'Impossible de recuperer les tarifs.'
        setRatesError(msg)
        setRates([])
      } finally {
        setRatesLoading(false)
      }
    }, 600)
    return () => clearTimeout(ratesTimer.current)
  }, [form.postal_code, cart])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    setApiError(null)
  }

  const shippingCost = selectedRate ? parseFloat(selectedRate.price) : 0

  // Apply promo code
  const handleApplyPromo = async (code) => {
    setPromoError(null)
    setPromoLoading(true)
    try {
      const subtotal = parseFloat(cart?.subtotal || 0)
      const { data } = await apiInstance.post('promo/apply/', { code, subtotal })
      setPromoCode(data.code)
      setDiscount(parseFloat(data.discount_amount))
    } catch (err) {
      const msg = err?.response?.data?.detail
        || err?.response?.data?.error
        || 'Code promo invalide ou expire.'
      setPromoError(msg)
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoCode('')
    setDiscount(0)
    setPromoError(null)
  }

  // Step 0 -> Step 1: validate shipping form
  const handleContinueToPayment = () => {
    const e = validateShipping(form, selectedRate)
    if (Object.keys(e).length) { setErrors(e); return }
    setStep(1)
  }

  // Step 1: créer la commande → obtenir l'URL Stripe → rediriger
  const handlePay = async () => {
    setPaying(true)
    setPayError(null)

    // 1. Creer la commande
    let createdOrder
    try {
      const { data } = await ordersAPI.create({
        ...form,
        shipping_method: selectedRate.code,
        shipping_cost:   shippingCost,
        promo_code:      promoCode || undefined,
        discount:        discount || 0,
      })
      createdOrder = data
    } catch (err) {
      const detail = err?.response?.data?.detail
        || Object.values(err?.response?.data || {})[0]
        || 'Erreur lors de la création de la commande.'
      setPayError(Array.isArray(detail) ? detail[0] : detail)
      setPaying(false)
      return
    }

    // 2. Créer la session Stripe et obtenir l'URL
    try {
      const { data } = await ordersAPI.stripeCheckout(createdOrder.order_number)
      // 3. Rediriger vers la page Stripe hébergée (comme dans lips_empire)
      window.location.href = data.checkout_url
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Erreur lors de la connexion à Stripe.'
      setPayError(detail)
      setPaying(false)
    }
  }

  if (!cart && step < 2) {
    return (
      <div className="checkout-page">
        <div className="checkout-header">
          <div className="checkout-header__inner">
            <h1 className="checkout-header__title">Finaliser la commande</h1>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ color: 'var(--gray-text)', marginBottom: 20 }}>Votre panier est vide.</p>
          <Link to="/catalogue" className="btn-gold">Découvrir la boutique</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <div className="checkout-header__inner">
          <h1 className="checkout-header__title">Finaliser la commande</h1>
          <StepIndicator current={step}/>
        </div>
      </div>

      <div className="checkout-body">
        <div className="checkout-container">
          <div className="checkout-main">

            {step === 0 && (
              <ShippingStep
                form={form}
                errors={errors}
                onChange={handleChange}
                rates={rates}
                ratesLoading={ratesLoading}
                ratesError={ratesError}
                selectedRate={selectedRate}
                onSelectRate={setSelectedRate}
              />
            )}

            {step === 1 && (
              <PaymentStep
                form={form}
                shippingCost={shippingCost}
                cart={cart}
                discount={discount}
                promoCode={promoCode}
                onPay={handlePay}
                paying={paying}
                payError={payError}
              />
            )}

            {step === 2 && <ConfirmationStep order={order}/>}

            {apiError && step < 2 && (
              <div className="checkout-api-error">{apiError}</div>
            )}

            {step < 2 && (
              <div className="checkout-nav">
                {step > 0 && (
                  <button className="btn-dark-outline" onClick={() => { setStep(s => s - 1); setPayError(null) }}>
                    Retour
                  </button>
                )}
                {step === 0 && (
                  <button className="btn-gold checkout-nav__next" onClick={handleContinueToPayment}>
                    Continuer
                  </button>
                )}
                {/* Step 1 has its own Pay button inside PaymentStep */}
              </div>
            )}
          </div>

          {step < 2 && (
            <aside className="checkout-sidebar">
              <OrderSummary
                cart={cart}
                shippingCost={shippingCost}
                discount={discount}
                promoCode={promoCode}
                promoError={promoError}
                promoLoading={promoLoading}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
