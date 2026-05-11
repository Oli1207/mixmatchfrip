/**
 * Gestion du code promo "en attente" détecté depuis l'URL (?promo=XXXX).
 * Le code est sauvegardé en localStorage et consommé au checkout.
 */

const PENDING_PROMO_KEY = 'mmf_pending_promo'

export const pendingPromo = {
  /** Sauvegarde un code (uppercase, trimmed). Écrase le précédent. */
  save: (code) => {
    if (code && typeof code === 'string') {
      localStorage.setItem(PENDING_PROMO_KEY, code.trim().toUpperCase())
    }
  },

  /** Lit le code en attente, ou '' si absent. */
  read: () => localStorage.getItem(PENDING_PROMO_KEY) || '',

  /** Supprime le code après utilisation (succès ou échec). */
  clear: () => localStorage.removeItem(PENDING_PROMO_KEY),
}
