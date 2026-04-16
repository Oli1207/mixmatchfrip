import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiCheck } from 'react-icons/fi'
import useCartStore from '../../store/cart'
import { formatPrice } from '../../utils/currency'
import './CartScreen.css'

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard (5-7 jours)', price: 4.99 },
  { id: 'express',  name: 'Express (2-3 jours)',  price: 12.99 },
  { id: 'pickup',   name: 'Retrait en magasin',   price: 0 },
]

function CartItem({ item, onQtyChange, onRemove }) {
  const product  = item.product
  const discount = product.discount_percent

  return (
    <div className="cart-item">
      <Link to={`/product/${product.slug}`} className="cart-item__img-wrap">
        <img
          src={product.main_image_url || 'https://via.placeholder.com/100x120?text=Photo'}
          alt={product.name}
          className="cart-item__img"
        />
      </Link>

      <div className="cart-item__info">
        <Link to={`/product/${product.slug}`} className="cart-item__name-link">
          <p className="cart-item__brand">{product.brand}</p>
          <h3 className="cart-item__name">{product.name}</h3>
        </Link>
        <div className="cart-item__meta">
          <span className="cart-item__tag">Taille {product.size}</span>
          {discount > 0 && <span className="cart-item__badge">-{discount}%</span>}
        </div>
        <div className="cart-item__prices">
          <span className="cart-item__price">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="cart-item__original">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </div>

      <div className="cart-item__controls">
        <div className="qty-control">
          <button className="qty-btn" onClick={() => onQtyChange(item.id, item.qty - 1)} aria-label="Diminuer">
            <FiMinus size={14}/>
          </button>
          <span className="qty-val">{item.qty}</span>
          <button className="qty-btn" onClick={() => onQtyChange(item.id, item.qty + 1)} aria-label="Augmenter">
            <FiPlus size={14}/>
          </button>
        </div>
      </div>

      <div className="cart-item__subtotal">
        <span className="cart-item__sub-label">Sous-total</span>
        <span className="cart-item__sub-price">{formatPrice(item.line_total)}</span>
      </div>

      <button className="cart-item__remove" onClick={() => onRemove(item.id)} aria-label="Supprimer">
        <FiTrash2 size={16}/>
      </button>
    </div>
  )
}

export default function CartScreen() {
  const navigate = useNavigate()
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore()

  useEffect(() => { fetchCart() }, [])

  const isEmpty = !cart || cart.item_count === 0

  // Shipping local state (selection UI, le vrai envoi se fait au checkout)
  const shipping = SHIPPING_OPTIONS[0]

  const total = cart
    ? (cart.total + shipping.price).toFixed(2)
    : '0.00'

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="cart-header__inner">
          <h1 className="cart-header__title">Votre panier</h1>
          <p className="cart-header__count">
            {cart ? `${cart.item_count} article${cart.item_count !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
      </div>

      {loading && !cart ? (
        <div className="cart-empty">
          <div className="cart-empty__inner">
            <p style={{ color: 'var(--gray-text)' }}>Chargement…</p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="cart-empty">
          <div className="cart-empty__inner">
            <h2>Votre panier est vide</h2>
            <p>Découvrez nos pièces de mode durable et ajoutez-les à votre panier.</p>
            <Link to="/catalogue" className="btn-gold">Continuer vos achats</Link>
          </div>
        </div>
      ) : (
        <div className="cart-body">
          <div className="cart-container">
            <div className="cart-main">
              <div className="cart-items">
                {cart.items.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQtyChange={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              <div className="cart-actions">
                <Link to="/catalogue" className="btn-dark-outline">
                  <FiArrowRight style={{ transform: 'rotate(180deg)' }}/>
                  Continuer les achats
                </Link>
              </div>
            </div>

            <aside className="cart-sidebar">
              <div className="cart-summary">
                <h3 className="cart-summary__title">Résumé</h3>

                <div className="cart-summary__row">
                  <span>Sous-total</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>

                <div className="cart-shipping">
                  <label className="cart-shipping__label">Livraison</label>
                  {SHIPPING_OPTIONS.map(opt => (
                    <label key={opt.id} className="cart-shipping__option">
                      <input type="radio" name="shipping" defaultChecked={opt.id === 'standard'} readOnly/>
                      <span className="cart-shipping__name">{opt.name}</span>
                      <span className="cart-shipping__price">
                        {opt.price > 0 ? `+${formatPrice(opt.price)}` : 'Gratuit'}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="cart-summary__divider"/>

                <div className="cart-summary__total">
                  <span>Total estimé</span>
                  <span className="cart-summary__total-price">{formatPrice(total)}</span>
                </div>

                <button className="btn-gold w-100" onClick={() => navigate('/checkout')}>
                  Procéder au paiement
                </button>

                <p className="cart-summary__note">
                  Paiement sécurisé via <strong>Paystack</strong>
                </p>
              </div>

              <div className="cart-info">
                <h4 className="cart-info__title">Avantages</h4>
                <ul className="cart-info__list">
                  <li><FiCheck size={13}/> Mode durable &amp; éthique</li>
                  <li><FiCheck size={13}/> Pièces vérifiées &amp; garanties</li>
                  <li><FiCheck size={13}/> Retours faciles sous 48h</li>
                  <li><FiCheck size={13}/> Emballage écologique</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}
