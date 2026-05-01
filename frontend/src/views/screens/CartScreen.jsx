import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiCheck } from 'react-icons/fi'
import useCartStore from '../../store/cart'
import { formatPrice } from '../../utils/currency'
import { loc } from '../../utils/loc'
import './CartScreen.css'

function CartItem({ item, onQtyChange, onRemove }) {
  const { t, i18n } = useTranslation()
  const lng      = i18n.language
  const product  = item.product
  const discount = product.discount_percent
  const name     = loc(product, 'name', lng)

  return (
    <div className="cart-item">
      <Link to={`/product/${product.slug}`} className="cart-item__img-wrap">
        <img src={product.main_image_url || 'https://via.placeholder.com/100x120?text=Photo'}
          alt={name} className="cart-item__img" />
      </Link>
      <div className="cart-item__info">
        <Link to={`/product/${product.slug}`} className="cart-item__name-link">
          <p className="cart-item__brand">{product.brand}</p>
          <h3 className="cart-item__name">{name}</h3>
        </Link>
        <div className="cart-item__meta">
          <span className="cart-item__tag">{t('common.size')} {product.size}</span>
          {discount > 0 && <span className="cart-item__badge">-{discount}%</span>}
        </div>
        <div className="cart-item__prices">
          <span className="cart-item__price">{formatPrice(product.price)}</span>
          {product.original_price && <span className="cart-item__original">{formatPrice(product.original_price)}</span>}
        </div>
      </div>
      <div className="cart-item__controls">
        <div className="qty-control">
          <button className="qty-btn" onClick={() => onQtyChange(item.id, item.qty - 1)} aria-label={t('cart.qty_decrease')}>
            <FiMinus size={14}/>
          </button>
          <span className="qty-val">{item.qty}</span>
          <button className="qty-btn" onClick={() => onQtyChange(item.id, item.qty + 1)} aria-label={t('cart.qty_increase')}>
            <FiPlus size={14}/>
          </button>
        </div>
      </div>
      <div className="cart-item__subtotal">
        <span className="cart-item__sub-label">{t('cart.subtotal')}</span>
        <span className="cart-item__sub-price">{formatPrice(item.line_total)}</span>
      </div>
      <button className="cart-item__remove" onClick={() => onRemove(item.id, product)} aria-label={t('cart.remove')}>
        <FiTrash2 size={16}/>
      </button>
    </div>
  )
}

export default function CartScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore()

  useEffect(() => { fetchCart() }, [])

  const isEmpty = !cart || cart.item_count === 0
  const total = cart ? cart.total : '0.00'

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="cart-header__inner">
          <h1 className="cart-header__title">{t('cart.your_cart')}</h1>
          <p className="cart-header__count">
            {cart ? `${cart.item_count} article${cart.item_count !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
      </div>

      {loading && !cart ? (
        <div className="cart-empty">
          <div className="cart-empty__inner">
            <p style={{ color: 'var(--gray-text)' }}>{t('common.loading')}</p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="cart-empty">
          <div className="cart-empty__inner">
            <h2>{t('cart.empty')}</h2>
            <p>{t('cart.empty_sub')}</p>
            <Link to="/catalogue" className="btn-gold">{t('cart.browse_btn')}</Link>
          </div>
        </div>
      ) : (
        <div className="cart-body">
          <div className="cart-container">
            <div className="cart-main">
              <div className="cart-items">
                {cart.items.map(item => (
                  <CartItem key={item.id} item={item} onQtyChange={updateItem} onRemove={removeItem} />
                ))}
              </div>
              <div className="cart-actions">
                <Link to="/catalogue" className="btn-dark-outline">
                  <FiArrowRight style={{ transform: 'rotate(180deg)' }}/>
                  {t('common.continue_shopping')}
                </Link>
              </div>
            </div>

            <aside className="cart-sidebar">
              <div className="cart-summary">
                <h3 className="cart-summary__title">{t('cart.summary_title')}</h3>
                <div className="cart-summary__row">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="cart-shipping">
                  <label className="cart-shipping__label">{t('cart.delivery')}</label>
                  <p className="cart-shipping__note">{t('cart.delivery_note')}</p>
                </div>
                <div className="cart-summary__divider"/>
                <div className="cart-summary__total">
                  <span>{t('cart.estimated_total')}</span>
                  <span className="cart-summary__total-price">{formatPrice(total)}</span>
                </div>
                <button className="btn-gold w-100" onClick={() => navigate('/checkout')}>
                  {t('cart.checkout_proceed')}
                </button>
                <p className="cart-summary__note">
                  {t('cart.secure_note')}
                </p>
              </div>

              <div className="cart-info">
                <h4 className="cart-info__title">{t('cart.advantages_title')}</h4>
                <ul className="cart-info__list">
                  <li><FiCheck size={13}/> {t('cart.adv_sustainable')}</li>
                  <li><FiCheck size={13}/> {t('cart.adv_verified')}</li>
                  <li><FiCheck size={13}/> {t('cart.adv_returns')}</li>
                  <li><FiCheck size={13}/> {t('cart.adv_eco')}</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}
