import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SiInstagram, SiTiktok } from 'react-icons/si'
import { FiMail, FiMapPin } from 'react-icons/fi'
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
  const [email, setEmail] = useState('')
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNewsletter = async (e) => {
    e.preventDefault()
    if (!checked) {
      Toast.fire({ icon: 'warning', title: 'Veuillez cocher la case pour continuer.' })
      return
    }
    setLoading(true)
    try {
      await apiInstance.post('newsletter/subscribe/', { email })
      Toast.fire({ icon: 'success', title: 'Merci de votre inscription !' })
      setEmail('')
      setChecked(false)
    } catch {
      Toast.fire({ icon: 'error', title: 'Inscription échouée, réessayez.' })
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
                La mode seconde main,<br />première qualité.
              </p>
              <p className="mmf-footer__newsletter-label">Recevez notre newsletter</p>
              <form className="mmf-footer__newsletter" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  placeholder="Votre email"
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
                <span>J'accepte de recevoir les offres exclusives</span>
              </label>
            </div>

            {/* Col 2 — Boutique */}
            <div className="mmf-footer__col">
              <h5 className="mmf-footer__col-title">Boutique</h5>
              <ul className="mmf-footer__list">
                <li><Link to="/catalogue" className="mmf-footer__link">Tous les articles</Link></li>
                <li><Link to="/catalogue?category=femme" className="mmf-footer__link">Femme</Link></li>
                <li><Link to="/catalogue?category=homme" className="mmf-footer__link">Homme</Link></li>
                <li><Link to="/catalogue?category=enfant" className="mmf-footer__link">Enfant</Link></li>
                <li><Link to="/catalogue?category=accessoires" className="mmf-footer__link">Accessoires</Link></li>
                <li><Link to="/soldes" className="mmf-footer__link mmf-footer__link--sale">Soldes</Link></li>
              </ul>
            </div>

            {/* Col 3 — Infos */}
            <div className="mmf-footer__col">
              <h5 className="mmf-footer__col-title">Informations</h5>
              <ul className="mmf-footer__list">
                <li><Link to="/about" className="mmf-footer__link">Notre histoire</Link></li>
                <li><Link to="/faq" className="mmf-footer__link">FAQ</Link></li>
                <li><Link to="/livraison" className="mmf-footer__link">Livraison & retours</Link></li>
                <li><Link to="/policy" className="mmf-footer__link">Politique de confidentialité</Link></li>
                <li><Link to="/contact" className="mmf-footer__link">Contact</Link></li>
              </ul>
            </div>

            {/* Col 4 — Contact + Réseaux */}
            <div className="mmf-footer__col">
              <h5 className="mmf-footer__col-title">Nous trouver</h5>
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

              <h5 className="mmf-footer__col-title" style={{ marginTop: '24px' }}>Réseaux sociaux</h5>
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
            © {new Date().getFullYear()} Mix&Match Frip. Tous droits réservés.
          </p>
          <p className="mmf-footer__sub-copy">
            Vêtements seconde main — Mode durable au Canada
          </p>
        </div>
      </div>

    </footer>
  )
}
