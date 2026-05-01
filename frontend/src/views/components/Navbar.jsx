import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { logout } from '../../utils/auth'
import useCartStore from '../../store/cart'
import { categoriesAPI } from '../../utils/api'
import { FiSearch, FiShoppingBag, FiUser, FiX, FiMenu, FiChevronDown, FiTruck, FiStar, FiSettings } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import logo from '../../assets/logo.jpeg'
import './Navbar.css'

export default function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const searchRef = useRef(null)
  const catRef = useRef(null)
  const userRef = useRef(null)

  const isLoggedIn  = useAuthStore((s) => s.isLoggedIn)
  const user        = useAuthStore((s) => s.user)
  const cartCount   = useCartStore((s) => s.cart?.item_count ?? 0)
  const fetchCart   = useCartStore((s) => s.fetchCart)
  const navigate    = useNavigate()
  const location    = useLocation()
  const [categories, setCategories] = useState([])

  useEffect(() => { fetchCart() }, [])

  useEffect(() => {
    categoriesAPI.list()
      .then(({ data }) => setCategories(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setCatOpen(false)
    setUserOpen(false)
  }, [location])

  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setSearchOpen(false)
  }

  const handleLogout = () => {
    logout()
    setUserOpen(false)
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Announcement Bar */}
      <div className="mmf-announce">
        <span>
          <FiTruck size={13} style={{ marginRight: 5, verticalAlign: 'middle' }}/>
          {t('navbar.announce_shipping')}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <FiStar size={13} style={{ marginRight: 5, verticalAlign: 'middle' }}/>
          {t('navbar.announce_new')}
        </span>
      </div>

      {/* Main Navbar */}
      <nav className={`mmf-nav${scrolled ? ' mmf-nav--scrolled' : ''}`}>
        <div className="mmf-nav__inner">

          {/* LEFT — links */}
          <ul className="mmf-nav__links">
            <li>
              <Link to="/catalogue" className={`mmf-nav__link${isActive('/catalogue') ? ' active' : ''}`}>
                {t('navbar.shop')}
              </Link>
            </li>
            {categories.length > 0 && (
              <li ref={catRef} className="mmf-nav__ddwrap">
                <button className="mmf-nav__link mmf-nav__link--btn" onClick={() => setCatOpen(v => !v)}>
                  {t('navbar.categories')} <FiChevronDown size={12} className={`mmf-chevron${catOpen ? ' open' : ''}`} />
                </button>
                {catOpen && (
                  <div className="mmf-nav__dd">
                    {categories.map(c => (
                      <Link key={c.slug} to={`/catalogue?category=${c.slug}`} className="mmf-nav__dd-item">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            )}
            <li>
              <Link to="/nouveautes" className={`mmf-nav__link${isActive('/nouveautes') ? ' active' : ''}`}>
                {t('navbar.new_arrivals')}
              </Link>
            </li>
            <li>
              <Link to="/soldes" className="mmf-nav__link mmf-nav__link--sale">{t('navbar.sales')}</Link>
            </li>
          </ul>

          {/* CENTER — Logo */}
          <Link to="/" className="mmf-nav__logo">
            <img src={logo} alt="Mix&Match Frip" />
          </Link>

          {/* RIGHT — Icons */}
          <div className="mmf-nav__icons">
            <button className="mmf-nav__icon" onClick={() => setSearchOpen(true)} aria-label={t('navbar.search_placeholder')}>
              <FiSearch size={19} />
            </button>

            <LanguageSwitcher />

            <div ref={userRef} className="mmf-nav__ddwrap">
              <button className="mmf-nav__icon" onClick={() => setUserOpen(v => !v)} aria-label={t('navbar.my_account')}>
                <FiUser size={19} />
              </button>
              {userOpen && (
                <div className="mmf-nav__dd mmf-nav__dd--right">
                  {isLoggedIn() ? (
                    <>
                      <div className="mmf-nav__dd-header">
                        {t('navbar.hello')}, {user?.full_name?.split(' ')[0] || ''}
                      </div>
                      {user?.is_staff && (
                        <Link to="/dashboard" className="mmf-nav__dd-item mmf-nav__dd-item--admin">
                          <FiSettings size={13} style={{ marginRight: 5 }}/>{t('navbar.admin_dashboard')}
                        </Link>
                      )}
                      <Link to="/account" className="mmf-nav__dd-item">{t('navbar.my_account')}</Link>
                      <Link to="/orders" className="mmf-nav__dd-item">{t('navbar.my_orders')}</Link>
                      <div className="mmf-nav__dd-divider" />
                      <button className="mmf-nav__dd-item mmf-nav__dd-item--logout" onClick={handleLogout}>
                        {t('navbar.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="mmf-nav__dd-item">{t('navbar.login')}</Link>
                      <Link to="/register" className="mmf-nav__dd-item">{t('navbar.create_account')}</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/cart" className="mmf-nav__icon mmf-nav__cart" aria-label={t('navbar.cart')}>
              <FiShoppingBag size={19} />
              {cartCount > 0 && <span className="mmf-nav__cart-badge">{cartCount}</span>}
            </Link>

            <button className="mmf-nav__icon mmf-nav__burger" onClick={() => setMobileOpen(v => !v)} aria-label="Menu">
              {mobileOpen ? <FiX size={21} /> : <FiMenu size={21} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="mmf-search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="mmf-search-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="mmf-search-form">
              <FiSearch size={18} className="mmf-search-ico" />
              <input
                ref={searchRef}
                type="text"
                placeholder={t('navbar.search_placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="mmf-search-input"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="mmf-search-close">
                <FiX size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`mmf-mobile${mobileOpen ? ' open' : ''}`}>
        <div className="mmf-mobile__inner">
          <Link to="/catalogue" className="mmf-mobile__link">{t('navbar.shop')}</Link>
          {categories.length > 0 && (
            <div className="mmf-mobile__section">
              <span className="mmf-mobile__section-title">{t('navbar.categories')}</span>
              {categories.map(c => (
                <Link key={c.slug} to={`/catalogue?category=${c.slug}`} className="mmf-mobile__link mmf-mobile__link--sub">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
          <Link to="/nouveautes" className="mmf-mobile__link">{t('navbar.new_arrivals')}</Link>
          <Link to="/soldes" className="mmf-mobile__link mmf-mobile__link--sale">{t('navbar.sales')}</Link>
          <div className="mmf-mobile__divider" />
          {isLoggedIn() ? (
            <>
              <Link to="/account" className="mmf-mobile__link">{t('navbar.my_account')}</Link>
              <Link to="/orders" className="mmf-mobile__link">{t('navbar.my_orders')}</Link>
              <button className="mmf-mobile__link mmf-mobile__link--logout" onClick={handleLogout}>{t('navbar.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mmf-mobile__link">{t('navbar.login')}</Link>
              <Link to="/register" className="mmf-mobile__link">{t('navbar.create_account')}</Link>
            </>
          )}
        </div>
      </div>
      {mobileOpen && <div className="mmf-mobile-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  )
}
