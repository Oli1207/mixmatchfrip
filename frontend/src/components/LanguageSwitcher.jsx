import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current  = i18n.language

  const toggle = (lng) => {
    if (lng !== current) i18n.changeLanguage(lng)
  }

  return (
    <div className="lang-sw" aria-label="Langue / Language">
      <button
        className={`lang-sw__btn${current === 'fr' ? ' active' : ''}`}
        onClick={() => toggle('fr')}
        aria-pressed={current === 'fr'}
      >
        FR
      </button>
      <span className="lang-sw__sep">|</span>
      <button
        className={`lang-sw__btn${current === 'en' ? ' active' : ''}`}
        onClick={() => toggle('en')}
        aria-pressed={current === 'en'}
      >
        EN
      </button>
    </div>
  )
}
