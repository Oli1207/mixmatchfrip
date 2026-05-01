import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SiInstagram, SiTiktok } from 'react-icons/si'
import { FiMail, FiMapPin } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import apiInstance from '../../utils/axios'
import Swal from 'sweetalert2'
import logo from '../../assets/logo.jpeg'
import './Footer.css'

const Toast = Swal.mixin({
  toast: true,
  position: 'top',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

export default function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNewsletter = async (e) => {
    e.preventDefault()
    if (!checked) {
      Toast.fire({ icon: 'warning', title: t('footer.toast_check') })
      return
    }
    setLoading(true)
    try {
      await apiInstance.post('newsletter/subscribe/', { email })
      Toast.fire({ icon: 'success', title: t('footer.toast_success') })
      setEmail('')
      setChecked(false)
    } catch {
      Toast.fire({ icon: 'error', title: t('footer.toast_error') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="mmf-footer">

      {/* ── Main grid ── */}
      <div className="mmf-footer__top">
        <div className="mmf-footer__container">
          <div className="mmf-footer__grid">

            {/* Col 1 — Brand + newsletter */}
            <div className="mmf-footer__brand">
              <Link to="/">
                <img src={logo} alt="Mix&Match Frip" className="mmf-footer__logo" />
              </Link>
              <p className="mmf-footer__tagline">
                {t('footer.tagline').split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
              <p className="mmf-footer__newsletter-label">{t('footer.newsletter_label')}</p>
              <form className="mmf-footer__newsletter" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  placeholder={t('footer.email_placeholder')}
                  className="mmf-footer__input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="mmf-footer__submit" disabled={loading}>
                  {loading ? '…' : 'OK'}
                </button>
              </form>
              <label className="mmf-footer__check-label">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => setChecked(e.target.checked)}
                  className="mmf-footer__check"
                />
                <span>{t('footer.newsletter_consent')}</span>
              </label>
            </div>

            {/* Col 2 — Boutique */}
            <div className="mmf-footer__col">
              <h5 className="mmf-footer__col-title">{t('footer.col_shop')}</h5>
              <ul className="mmf-footer__list">
                <li><Link to="/catalogue" className="mmf-footer__link">{t('footer.all_items')}</Link></li>
                <li><Link to="/catalogue?category=femme" className="mmf-footer__link">{t('footer.women')}</Link></li>
                <li><Link to="/catalogue?category=homme" className="mmf-footer__link">{t('footer.men')}</Link></li>
                <li><Link to="/catalogue?category=enfant" className="mmf-footer__link">{t('footer.kids')}</Link></li>
                <li><Link to="/catalogue?category=accessoires" className="mmf-footer__link">{t('footer.accessories')}</Link></li>
                <li><Link to="/soldes" className="mmf-footer__link mmf-footer__link--sale">{t('footer.sales')}</Link></li>
              </ul>
            </div>

            {/* Col 3 — Infos */}
            <div className="mmf-footer__col">
              <h5 className="mmf-footer__col-title">{t('footer.col_info')}</h5>
              <ul className="mmf-footer__list">
                <li><Link to="/about" className="mmf-footer__link">{t('footer.our_story')}</Link></li>
                <li><Link to="/faq" className="mmf-footer__link">{t('footer.faq')}</Link></li>
                <li><Link to="/livraison" className="mmf-footer__link">{t('footer.shipping_returns')}</Link></li>
                <li><Link to="/policy" className="mmf-footer__link">{t('footer.privacy')}</Link></li>
                <li><Link to="/contact" className="mmf-footer__link">{t('footer.contact')}</Link></li>
              </ul>
            </div>

            {/* Col 4 — Contact + Réseaux */}
            <div className="mmf-footer__col">
              <h5 className="mmf-footer__col-title">{t('footer.col_find_us')}</h5>
              <ul className="mmf-footer__list">
                <li>
                  <a href="mailto:support@mixmatchfrip.com" className="mmf-footer__link mmf-footer__link--icon">
                    <FiMail size={13} /> support@mixmatchfrip.com
                  </a>
                </li>
                <li>
                  <span className="mmf-footer__link mmf-footer__link--icon">
                    <FiMapPin size={13} /> Canada
                  </span>
                </li>
              </ul>

              <h5 className="mmf-footer__col-title" style={{ marginTop: '24px' }}>{t('footer.col_social')}</h5>
              <div className="mmf-footer__socials">
                <a
                  href="https://www.instagram.com/mixmatch_frip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mmf-footer__social"
                  aria-label="Instagram"
                >
                  <SiInstagram size={17} />
                </a>
                <a
                  href="https://www.tiktok.com/@mixmatchfrip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mmf-footer__social"
                  aria-label="TikTok"
                >
                  <SiTiktok size={17} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="mmf-footer__bottom">
        <div className="mmf-footer__container">
          <p className="mmf-footer__copy">
            © {new Date().getFullYear()} Mix&Match Frip. {t('footer.copyright')}
          </p>
          <p className="mmf-footer__sub-copy">
            {t('footer.sub_copy')}
          </p>
        </div>
      </div>

    </footer>
  )
}
