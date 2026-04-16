/**
 * Formate un prix en dollars canadiens.
 * Exemple : formatPrice(24.9) → "24.90 $ CAD"
 */
export function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return '0.00 $ CAD'
  return `${parseFloat(amount).toFixed(2)} $ CAD`
}
