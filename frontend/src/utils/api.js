import apiInstance from './axios'

// ─── Categories ──────────────────────────────────────────────────────────────

export const categoriesAPI = {
  list:             ()     => apiInstance.get('categories/'),
  subcategoriesBySlug: (slug) => apiInstance.get(`categories/${slug}/subcategories/`),
}

// ─── User account ────────────────────────────────────────────────────────────

export const userAPI = {
  me:             ()       => apiInstance.get('user/me/'),
  update:         (data)   => apiInstance.put('user/me/update/', data),
  changePassword: (data)   => apiInstance.post('user/me/change-password/', data),
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsAPI = {
  /**
   * @param {Object} params — { category, size, condition, min_price, max_price, search, sort }
   */
  list:   (params = {}) => apiInstance.get('products/', { params }),
  detail: (slug)        => apiInstance.get(`products/${slug}/`),
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const wishlistAPI = {
  list:   ()          => apiInstance.get('wishlist/'),
  toggle: (productId) => apiInstance.post('wishlist/toggle/', { product_id: productId }),
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
// Le cart_id est stocké en localStorage pour fonctionner sans sessions Django

const CART_KEY = 'mmf_cart_id'
export const getLocalCartId  = ()   => localStorage.getItem(CART_KEY) || ''
export const saveLocalCartId = (id) => { if (id) localStorage.setItem(CART_KEY, String(id)) }

export const cartAPI = {
  get:    ()                     => apiInstance.get('cart/', { params: { cart_id: getLocalCartId() } }),
  add:    (productId, qty = 1)   => apiInstance.post('cart/add/',           { product_id: productId, qty,   cart_id: getLocalCartId() }),
  update: (itemId, qty)          => apiInstance.patch(`cart/item/${itemId}/`, { qty,                         cart_id: getLocalCartId() }),
  remove: (itemId)               => apiInstance.delete(`cart/item/${itemId}/remove/`, { params: { cart_id: getLocalCartId() } }),
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersAPI = {
  create:        (payload)               => apiInstance.post('orders/create/', payload),
  list:          ()                      => apiInstance.get('orders/'),
  detail:        (orderNumber)           => apiInstance.get(`orders/${orderNumber}/`),
  stripeCheckout: (orderNumber)            => apiInstance.post(`orders/${orderNumber}/stripe-checkout/`),
  paymentSuccess: (orderNumber, sessionId) => apiInstance.post(`orders/${orderNumber}/payment-success/`, { session_id: sessionId }),
}

// ─── Shipping ─────────────────────────────────────────────────────────────────

export const shippingAPI = {
  getRates: (postalCode, weightG = 500, cartValue = null) =>
    apiInstance.post('shipping/rates/', {
      postal_code: postalCode,
      weight_g:    weightG,
      ...(cartValue != null ? { cart_value: cartValue } : {}),
    }),
}
