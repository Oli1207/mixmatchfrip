/**
 * MixMatchFrip — Analytics Module
 * Tracking des sessions, sources UTM et événements e-commerce.
 * Toutes les requêtes sont fire-and-forget (erreurs silencieuses).
 */

import apiInstance from '../utils/axios'

const SESSION_KEY = 'mmf_session_id'
const SESSION_INIT_KEY = 'mmf_session_init'

// ── Génération UUID v4 ────────────────────────────────────────────────────────

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ── Session ID (persistant dans localStorage) ─────────────────────────────────

export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = generateUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// ── Lecture des paramètres UTM depuis l'URL ───────────────────────────────────

export function getUTMParams(search = window.location.search) {
  const p = new URLSearchParams(search)
  return {
    utm_source:   p.get('utm_source')   || '',
    utm_medium:   p.get('utm_medium')   || '',
    utm_campaign: p.get('utm_campaign') || '',
    utm_content:  p.get('utm_content')  || '',
    utm_term:     p.get('utm_term')     || '',
  }
}

// ── Initialisation de la session (une fois par session) ───────────────────────

export async function initSession() {
  const sessionId = getSessionId()

  // Ne réinitialiser que si on a de nouveaux UTM params ou pas encore initialisé
  const utms        = getUTMParams()
  const hasNewUTMs  = Object.values(utms).some(Boolean)
  const alreadyInit = sessionStorage.getItem(SESSION_INIT_KEY)

  if (alreadyInit && !hasNewUTMs) return sessionId

  try {
    await apiInstance.post('analytics/session/', {
      session_id:   sessionId,
      referrer:     document.referrer || '',
      landing_page: window.location.pathname + window.location.search,
      ...utms,
    })
    sessionStorage.setItem(SESSION_INIT_KEY, '1')
  } catch {
    // Silencieux
  }

  return sessionId
}

// ── Tracker d'événement générique ────────────────────────────────────────────

export function track(eventType, properties = {}, page = window.location.pathname) {
  const sessionId = getSessionId()

  apiInstance.post('analytics/event/', {
    session_id: sessionId,
    event_type: eventType,
    page,
    properties,
  }).catch(() => {}) // Fire-and-forget
}

// ── Événements e-commerce nommés ─────────────────────────────────────────────

export const events = {
  pageView: (page) =>
    track('page_view', {}, page),

  viewProduct: (product) =>
    track('view_product', {
      product_id:   product.id,
      product_name: product.name,
      brand:        product.brand,
      price:        product.price,
      category:     product.category?.name,
    }),

  addToCart: (product, qty = 1) =>
    track('add_to_cart', {
      product_id:   product.id,
      product_name: product.name,
      price:        product.price,
      qty,
    }),

  removeFromCart: (productId, productName) =>
    track('remove_from_cart', { product_id: productId, product_name: productName }),

  addToWishlist: (product) =>
    track('add_to_wishlist', {
      product_id:   product.id,
      product_name: product.name,
      price:        product.price,
    }),

  beginCheckout: (cartTotal, itemCount) =>
    track('begin_checkout', { cart_total: cartTotal, item_count: itemCount }),

  checkoutStep: (step, stepName) =>
    track('checkout_step', { step, step_name: stepName }),

  purchase: (orderNumber, total, itemCount) =>
    track('purchase', {
      order_number: orderNumber,
      total,
      item_count:   itemCount,
    }),

  search: (query, resultsCount) =>
    track('search', { query, results_count: resultsCount }),

  newsletterSub: () =>
    track('newsletter_sub', {}),

  /**
   * Déclenché quand un code promo est appliqué avec succès.
   * @param {string} code           — ex: 'ETE20'
   * @param {number} discountAmount — montant réduit en $
   * @param {string} [trigger]      — 'manual' | 'url_auto'
   */
  promoApplied: (code, discountAmount, trigger = 'manual') =>
    track('promo_applied', {
      promo_code:      code,
      discount_amount: discountAmount,
      trigger,
    }),
}
