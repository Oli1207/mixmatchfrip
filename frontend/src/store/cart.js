import { create } from 'zustand'
import { cartAPI, saveLocalCartId } from '../utils/api'

const useCartStore = create((set, get) => ({
  cart:    null,   // { id, cart_id, items, subtotal, tax, total, item_count }
  loading: false,
  error:   null,

  // ── Fetch ──────────────────────────────────────────────────────────────────
  fetchCart: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await cartAPI.get()
      saveLocalCartId(data.cart_id)
      set({ cart: data, loading: false })
    } catch (err) {
      set({ loading: false, error: 'Impossible de charger le panier.' })
    }
  },

  // ── Add ────────────────────────────────────────────────────────────────────
  addItem: async (productId, qty = 1) => {
    set({ loading: true, error: null })
    try {
      const { data } = await cartAPI.add(productId, qty)
      saveLocalCartId(data.cart_id)
      set({ cart: data, loading: false })
      return { success: true }
    } catch (err) {
      const msg = err?.response?.data?.detail || "Erreur lors de l'ajout."
      set({ loading: false, error: msg })
      return { success: false, error: msg }
    }
  },

  // ── Update qty ─────────────────────────────────────────────────────────────
  updateItem: async (itemId, qty) => {
    set({ loading: true, error: null })
    try {
      const { data } = await cartAPI.update(itemId, qty)
      saveLocalCartId(data.cart_id)
      set({ cart: data, loading: false })
    } catch (err) {
      set({ loading: false, error: err?.response?.data?.detail || 'Erreur.' })
    }
  },

  // ── Remove ─────────────────────────────────────────────────────────────────
  removeItem: async (itemId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await cartAPI.remove(itemId)
      saveLocalCartId(data.cart_id)
      set({ cart: data, loading: false })
    } catch (err) {
      set({ loading: false, error: err?.response?.data?.detail || 'Erreur.' })
    }
  },

  // ── Clear local (après commande confirmée) ─────────────────────────────────
  clearCart: () => set({ cart: null }),

  // ── Helpers ────────────────────────────────────────────────────────────────
  itemCount: () => get().cart?.item_count ?? 0,
}))

export default useCartStore
