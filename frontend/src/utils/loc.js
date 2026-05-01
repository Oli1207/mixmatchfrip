/**
 * loc(obj, field, lang)
 * ─────────────────────────────────────────────────────────────────
 * Returns the localized value of a content field from an API object.
 *
 * Rules:
 *  - If lang === 'en' AND obj[field_en] is non-empty → return English version
 *  - Otherwise → return French version (obj[field])
 *  - Always falls back gracefully (never returns undefined)
 *
 * Usage:
 *   import { loc } from '../../utils/loc'
 *   const { i18n } = useTranslation()
 *   const name = loc(product, 'name', i18n.language)   // → name_en if EN and non-empty
 *   const desc = loc(product, 'description', i18n.language)
 */
export function loc(obj, field, lang) {
  if (!obj) return ''
  if (lang === 'en') {
    const enVal = obj[`${field}_en`]
    if (enVal && String(enVal).trim()) return enVal
  }
  return obj[field] ?? ''
}
