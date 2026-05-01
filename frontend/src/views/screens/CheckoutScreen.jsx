import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiChevronDown, FiChevronUp, FiCheck, FiLock, FiAlertCircle, FiTag, FiX } from 'react-icons/fi'
import useCartStore from '../../store/cart'
import useAuthStore from '../../store/auth'
import { ordersAPI, shippingAPI, getLocalCartId, userAPI } from '../../utils/api'
import apiInstance from '../../utils/axios'
import { formatPrice } from '../../utils/currency'
import { loc } from '../../utils/loc'
import { events as analyticsEvents } from '../../analytics/analytics'
import './CheckoutScreen.css'

const PROVINCES = [
  'Alberta', 'Colombie-Britannique', 'Manitoba', 'Nouveau-Brunswick',
  'Nouvelle-Écosse', 'Ontario', 'Québec', 'Saskatchewan',
  'Terre-Neuve-et-Labrador', 'Île-du-Prince-Édouard',
  'Territoires du Nord-Ouest', 'Nunavut', 'Yukon',
]

function StepIndicator({ current, steps }) {
  return (
    <div className="step-indicator">
      {steps.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={label} className="step-indicator__item">
            <div className={`step-indicator__circle ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
              {done ? <FiCheck size={14}/> : <span>{i + 1}</span>}
            </div>
            <span className={`step-indicator__label ${active ? 'active' : ''}`}>{label}</span>
            {i < steps.length - 1 && <div className={`step-indicator__line ${done ? 'done' : ''}`}/>}
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

function ShippingStep({ form, errors, onChange, rates, ratesLoading, ratesError, selectedRate, onSelectRate, isGuest, createAccount, onToggleCreateAccount, saveAddress, onToggleSaveAddress, t }) {
  return (
    <div className="checkout-step">
      <h2 className="checkout-step__title">{t('checkout.shipping_title')}</h2>
      <div className="form-row">
        <Field label={t('checkout.field_first_name')} id="first_name" error={errors.first_name}>
          <input id="first_name" className={`input ${errors.first_name ? 'input--error' : ''}`}
            name="first_name" value={form.first_name} onChange={onChange} placeholder="Marie"/>
        </Field>
        <Field label={t('checkout.field_last_name')} id="last_name" error={errors.last_name}>
          <input id="last_name" className={`input ${errors.last_name ? 'input--error' : ''}`}
            name="last_name" value={form.last_name} onChange={onChange} placeholder="Dupont"/>
        </Field>
      </div>
      <Field label={t('checkout.field_email')} id="email" error={errors.email}>
        <input id="email" className={`input ${errors.email ? 'input--error' : ''}`}
          name="email" value={form.email} onChange={onChange} placeholder="marie@exemple.ca" type="email"/>
      </Field>
      <Field label={t('checkout.field_address')} id="address" error={errors.address}>
        <input id="address" className={`input ${errors.address ? 'input--error' : ''}`}
          name="address" value={form.address} onChange={onChange} placeholder="123 rue Sainte-Catherine"/>
      </Field>
      <div className="form-row">
        <Field label={t('checkout.field_city')} id="city" error={errors.city}>
          <input id="city" className={`input ${errors.city ? 'input--error' : ''}`}
            name="city" value={form.city} onChange={onChange} placeholder="Gatineau"/>
        </Field>
        <Field label={t('checkout.field_province')} id="province" error={errors.province}>
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
        <Field label={t('checkout.field_postal')} id="postal_code" error={errors.postal_code}>
          <input id="postal_code" className={`input ${errors.postal_code ? 'input--error' : ''}`}
            name="postal_code" value={form.postal_code} onChange={onChange} placeholder="H2X 1Y6"/>
        </Field>
        <Field label={t('checkout.field_phone')} id="phone" error={errors.phone}>
          <input id="phone" className={`input ${errors.phone ? 'input--error' : ''}`}
            name="phone" value={form.phone} onChange={onChange} placeholder="+1 514 000 0000" type="tel"/>
        </Field>
      </div>

      <Field label={t('checkout.shipping_method_title')} id="shipping_method" error={errors.shipping_method}>
        <div className="shipping-options">
          {ratesLoading ? (
            <div className="shipping-options__loading">{t('checkout.rates_loading_chitchats')}</div>
          ) : ratesError ? (
            <div className="shipping-options__hint shipping-options__hint--error">
              <FiAlertCircle size={14}/>{ratesError}
            </div>
          ) : rates.length === 0 ? (
            <div className="shipping-options__hint">
              <FiAlertCircle size={14}/>{t('checkout.rates_empty')}
            </div>
          ) : (
            rates.map(rate => (
              <label key={rate.code} className={`shipping-option${selectedRate?.code === rate.code ? ' selected' : ''}`}>
                <input type="radio" name="shipping_method" value={rate.code}
                  checked={selectedRate?.code === rate.code} onChange={() => onSelectRate(rate)} />
                <div className="shipping-option__info">
                  <span className="shipping-option__name">{rate.name}</span>
                  {rate.days && rate.code !== 'pickup' && (
                    <span className="shipping-option__days">{rate.days} jour{rate.days !== '1' ? 's' : ''} ouvrable{rate.days !== '1' ? 's' : ''}</span>
                  )}
                </div>
                <span className="shipping-option__price">
                  {rate.price > 0 ? formatPrice(rate.price) : t('checkout.free')}
                </span>
              </label>
            ))
          )}
        </div>
      </Field>

      <Field label={t('checkout.field_instructions')} id="instructions">
        <textarea id="instructions" className="input textarea"
          name="instructions" value={form.instructions} onChange={onChange}
          placeholder="Ex: code d'accès, appartement…" rows={3}/>
      </Field>

      {isGuest && (
        <div className="checkout-create-account">
          <label className="checkout-create-account__label">
            <input type="checkbox" className="checkout-create-account__checkbox"
              checked={createAccount} onChange={e => onToggleCreateAccount(e.target.checked)} />
            <span>{t('checkout.create_account_checkbox')}</span>
          </label>
          {createAccount && (
            <p className="checkout-create-account__hint">{t('checkout.create_account_hint')}</p>
          )}
        </div>
      )}
      {!isGuest && (
        <div className="checkout-create-account">
          <label className="checkout-create-account__label">
            <input type="checkbox" className="checkout-create-account__checkbox"
              checked={saveAddress} onChange={e => onToggleSaveAddress(e.target.checked)} />
            <span>{t('checkout.save_address_full')}</span>
          </label>
        </div>
      )}
    </div>
  )
}

function PaymentStep({ form, shippingCost, cart, discount, promoCode, onPay, paying, payError, t }) {
  const subtotal = parseFloat(cart?.subtotal || 0)
  const total    = Math.max(0, subtotal - discount + shippingCost).toFixed(2)

  return (
    <div className="checkout-step">
      <h2 className="checkout-step__title">{t('checkout.payment_title')}</h2>
      <div className="payment-summary">
        <div className="payment-summary__row">
          <span>{t('checkout.payment_shipping_to')}</span>
          <span>{form.first_name} {form.last_name} &mdash; {form.city}</span>
        </div>
        <div className="payment-summary__row">
          <span>{t('checkout.subtotal')}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="payment-summary__row payment-summary__row--discount">
            <span>{t('checkout.discount')} ({promoCode})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="payment-summary__row">
          <span>{t('checkout.shipping_cost')}</span>
          <span>{shippingCost > 0 ? formatPrice(shippingCost) : t('checkout.free')}</span>
        </div>
        <div className="payment-summary__row payment-summary__row--total">
          <span>{t('checkout.total')}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <div className="payment-notice">
        <FiLock size={14}/>
        <span>{t('checkout.secure_note')}</span>
      </div>
      <div className="payment-logos">
        <span>Visa</span><span>Mastercard</span><span>Amex</span>
      </div>
      {payError && <div className="checkout-api-error" style={{ marginBottom: 16 }}>{payError}</div>}
      <button className="btn-gold pay-btn" onClick={onPay} disabled={paying}>
        {paying ? t('checkout.paying') : `${t('checkout.pay_btn').replace('{{amount}}', formatPrice(total))}`}
      </button>
    </div>
  )
}

function ConfirmationStep({ order, canViewOrders, t }) {
  const navigate = useNavigate()
  return (
    <div className="checkout-confirm">
      <div className="checkout-confirm__icon"><FiCheck size={28}/></div>
      <h2 className="checkout-confirm__title">{t('checkout.confirm_title')}</h2>
      <p className="checkout-confirm__text">
        {t('checkout.confirm_text').replace('#{order}', `#${order?.order_number}`).replace('{email}', order?.email)}
      </p>
      <div className="checkout-confirm__actions">
        <button className="btn-gold" onClick={() => navigate('/catalogue')}>{t('common.continue_shopping')}</button>
        {canViewOrders && (
          <button className="btn-dark-outline" onClick={() => navigate('/orders')}>{t('checkout.my_orders_btn')}</button>
        )}
      </div>
    </div>
  )
}

function PromoWidget({ onApply, onRemove, promoCode, discount, promoError, promoLoading, t }) {
  const [input, setInput] = useState('')
  const handleApply = () => { if (input.trim()) onApply(input.trim().toUpperCase()) }

  if (promoCode) {
    return (
      <div className="promo-widget promo-widget--applied">
        <FiTag size={14}/>
        <span className="promo-widget__code">{promoCode}</span>
        <span className="promo-widget__saving">-{formatPrice(discount)}</span>
        <button className="promo-widget__remove" onClick={onRemove} title={t('checkout.promo_remove')}>
          <FiX size={14}/>
        </button>
      </div>
    )
  }
  return (
    <div className="promo-widget">
      <div className="promo-widget__row">
        <input className="input promo-widget__input" placeholder={t('checkout.promo_placeholder')}
          value={input} onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleApply()} maxLength={50} />
        <button className="promo-widget__btn" onClick={handleApply} disabled={promoLoading || !input.trim()}>
          {promoLoading ? '...' : t('checkout.promo_apply')}
        </button>
      </div>
      {promoError && <p className="promo-widget__error">{promoError}</p>}
    </div>
  )
}

function OrderSummary({ cart, shippingCost, discount, promoCode, promoError, promoLoading, onApplyPromo, onRemovePromo, t, lng }) {
  const [open, setOpen] = useState(false)
  if (!cart) return null
  const subtotal = parseFloat(cart.subtotal)
  const total    = Math.max(0, subtotal - discount + shippingCost).toFixed(2)

  return (
    <div className="order-summary">
      <button className="order-summary__toggle" onClick={() => setOpen(o => !o)}>
        <span>{t('checkout.order_summary_items').replace('{{count}}', cart.item_count)}</span>
        {open ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}
      </button>
      {open && (
        <div className="order-summary__items">
          {cart.items.map(item => (
            <div key={item.id} className="order-summary__item">
              <div className="order-summary__img-wrap">
                <img src={item.product.main_image_url || 'https://via.placeholder.com/48x60'} alt={loc(item.product, 'name', lng)}/>
                <span className="order-summary__qty">{item.qty}</span>
              </div>
              <div className="order-summary__info">
                <p className="order-summary__brand">{item.product.brand}</p>
                <p className="order-summary__name">{loc(item.product, 'name', lng)}</p>
              </div>
              <span className="order-summary__price">{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="order-summary__rows">
        <div className="order-summary__row"><span>{t('checkout.subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
        {discount > 0 && (
          <div className="order-summary__row order-summary__row--discount">
            <span>{t('checkout.discount')} ({promoCode})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="order-summary__row">
          <span>{t('checkout.shipping_cost')}</span>
          <span>{shippingCost > 0 ? formatPrice(shippingCost) : t('checkout.free')}</span>
        </div>
        <div className="order-summary__total"><span>{t('checkout.total')}</span><span>{formatPrice(total)}</span></div>
      </div>
      <div className="order-summary__promo">
        <PromoWidget onApply={onApplyPromo} onRemove={onRemovePromo}
          promoCode={promoCode} discount={discount} promoError={promoError} promoLoading={promoLoading} t={t}/>
      </div>
    </div>
  )
}

function validateShipping(form, selectedRate, t) {
  const e = {}
  if (!form.first_name.trim()) e.first_name = t('checkout.required')
  if (!form.last_name.trim())  e.last_name  = t('checkout.required')
  if (!form.email.trim())      e.email      = t('checkout.required')
  if (!form.address.trim())    e.address    = t('checkout.required')
  if (!form.city.trim())       e.city       = t('checkout.required')
  if (!form.province)          e.province   = t('checkout.required')
  if (!form.postal_code.trim()) e.postal_code = t('checkout.required')
  if (!form.phone.trim())      e.phone      = t('checkout.required')
  if (!selectedRate)           e.shipping_method = t('checkout.choose_shipping')
  return e
}

export default function CheckoutScreen() {
  const { t, i18n } = useTranslation()
  const lng = i18n.language
  const navigate                    = useNavigate()
  const { isLoggedIn, allUserData } = useAuthStore()
  const { cart, fetchCart, clearCart } = useCartStore()

  const STEPS = [t('checkout.step_shipping'), t('checkout.step_payment'), t('checkout.step_confirmation')]

  const [step,           setStep]          = useState(0)
  const [errors,         setErrors]        = useState({})
  const [apiError,       setApiError]      = useState(null)
  const [order,          setOrder]         = useState(null)
  const [createAccount,  setCreateAccount] = useState(false)
  const [saveAddress,    setSaveAddress]   = useState(false)
  const [rates,        setRates]       = useState([])
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesError,   setRatesError]  = useState(null)
  const [selectedRate, setSelectedRate] = useState(null)
  const ratesTimer = useRef(null)
  const [paying,       setPaying]      = useState(false)
  const [payError,     setPayError]    = useState(null)
  const [promoCode,    setPromoCode]   = useState('')
  const [discount,     setDiscount]    = useState(0)
  const [promoError,   setPromoError]  = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: allUserData?.email || '',
    phone: allUserData?.phone || '', address: '', city: '', province: '',
    postal_code: '', instructions: '',
  })

  useEffect(() => {
    if (cart) analyticsEvents.beginCheckout(cart.total, cart.item_count)
  }, [!!cart]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCart()
    if (isLoggedIn()) {
      userAPI.me().then(({ data }) => {
        const parts = (data.full_name || '').trim().split(/\s+/)
        setForm(prev => ({
          ...prev,
          first_name: parts[0] || prev.first_name,
          last_name:  parts.slice(1).join(' ') || prev.last_name,
          email:      data.email || prev.email,
          phone:      data.phone || prev.phone,
        }))
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    const postal = form.postal_code.replace(' ', '')
    if (postal.length < 6) { setRates([]); setSelectedRate(null); return }
    clearTimeout(ratesTimer.current)
    ratesTimer.current = setTimeout(async () => {
      setRatesLoading(true); setRatesError(null)
      const weightG = cart?.items?.reduce((sum, item) => sum + (item.product.weight_g || 400) * item.qty, 0) || 500
      const cartSubtotal = parseFloat(cart?.subtotal || 0)
      try {
        const { data } = await shippingAPI.getRates(postal, weightG, cartSubtotal || null)
        setRates(data)
        const first = data.find(r => r.code !== 'pickup') || data[0]
        setSelectedRate(first || null)
      } catch (err) {
        const msg = err?.response?.data?.detail || t('checkout.rates_error')
        setRatesError(msg); setRates([])
      } finally { setRatesLoading(false) }
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

  const handleApplyPromo = async (code) => {
    setPromoError(null); setPromoLoading(true)
    try {
      const subtotal = parseFloat(cart?.subtotal || 0)
      const { data } = await apiInstance.post('promo/apply/', { code, subtotal })
      setPromoCode(data.code); setDiscount(parseFloat(data.discount_amount))
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || 'Code promo invalide ou expiré.'
      setPromoError(msg)
    } finally { setPromoLoading(false) }
  }

  const handleRemovePromo = () => { setPromoCode(''); setDiscount(0); setPromoError(null) }

  const handleContinueToPayment = () => {
    const e = validateShipping(form, selectedRate, t)
    if (Object.keys(e).length) { setErrors(e); return }
    if (isLoggedIn() && saveAddress) {
      userAPI.update({ full_name: `${form.first_name} ${form.last_name}`.trim(), phone: form.phone }).catch(() => {})
    }
    analyticsEvents.checkoutStep(1, 'paiement')
    setStep(1)
  }

  const handlePay = async () => {
    if (!selectedRate) { setPayError(t('checkout.go_back_shipping')); return }
    setPaying(true); setPayError(null)
    let createdOrder
    try {
      const { data } = await ordersAPI.create({
        ...form, shipping_method: selectedRate.code, shipping_cost: shippingCost,
        cart_id: getLocalCartId(), promo_code: promoCode || undefined,
        discount: discount || 0, create_account: !isLoggedIn() ? createAccount : false,
      })
      createdOrder = data
    } catch (err) {
      const detail = err?.response?.data?.detail || Object.values(err?.response?.data || {})[0] || t('common.error')
      setPayError(Array.isArray(detail) ? detail[0] : detail)
      setPaying(false); return
    }
    try {
      const { data } = await ordersAPI.stripeCheckout(createdOrder.order_number)
      window.location.href = data.checkout_url
    } catch (err) {
      const detail = err?.response?.data?.detail || t('common.error')
      setPayError(detail); setPaying(false)
    }
  }

  if (!cart && step < 2) {
    return (
      <div className="checkout-page">
        <div className="checkout-header">
          <div className="checkout-header__inner">
            <h1 className="checkout-header__title">{t('checkout.title')}</h1>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ color: 'var(--gray-text)', marginBottom: 20 }}>{t('checkout.cart_empty')}</p>
          <Link to="/catalogue" className="btn-gold">{t('checkout.browse_btn')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <div className="checkout-header__inner">
          <h1 className="checkout-header__title">{t('checkout.title')}</h1>
          <StepIndicator current={step} steps={STEPS}/>
        </div>
      </div>

      <div className="checkout-body">
        <div className="checkout-container">
          <div className="checkout-main">
            {step === 0 && (
              <ShippingStep form={form} errors={errors} onChange={handleChange}
                rates={rates} ratesLoading={ratesLoading} ratesError={ratesError}
                selectedRate={selectedRate} onSelectRate={setSelectedRate}
                isGuest={!isLoggedIn()} createAccount={createAccount}
                onToggleCreateAccount={setCreateAccount} saveAddress={saveAddress}
                onToggleSaveAddress={setSaveAddress} t={t} />
            )}
            {step === 1 && (
              <PaymentStep form={form} shippingCost={shippingCost} cart={cart}
                discount={discount} promoCode={promoCode}
                onPay={handlePay} paying={paying} payError={payError} t={t}/>
            )}
            {step === 2 && <ConfirmationStep order={order} canViewOrders={isLoggedIn() || order?.account_created} t={t}/>}

            {apiError && step < 2 && <div className="checkout-api-error">{apiError}</div>}

            {step < 2 && (
              <div className="checkout-nav">
                {step > 0 && (
                  <button className="btn-dark-outline" onClick={() => { setStep(s => s - 1); setPayError(null) }}>
                    {t('checkout.back_btn')}
                  </button>
                )}
                {step === 0 && (
                  <button className="btn-gold checkout-nav__next" onClick={handleContinueToPayment}>
                    {t('checkout.continue_btn_short')}
                  </button>
                )}
              </div>
            )}
          </div>

          {step < 2 && (
            <aside className="checkout-sidebar">
              <OrderSummary cart={cart} shippingCost={shippingCost} discount={discount}
                promoCode={promoCode} promoError={promoError} promoLoading={promoLoading}
                onApplyPromo={handleApplyPromo} onRemovePromo={handleRemovePromo} t={t} lng={lng}/>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
