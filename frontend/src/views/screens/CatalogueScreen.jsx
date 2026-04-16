import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi'
import { productsAPI, categoriesAPI } from '../../utils/api'
import './CatalogueScreen.css'

const SIZES = ['XS','S','M','L','XL','XXL','unique']
const CONDITIONS = [
  { value: 'new_with_tags', label: 'Neuf avec étiquette' },
  { value: 'excellent',     label: 'Excellent état' },
  { value: 'very_good',     label: 'Très bon état' },
  { value: 'good',          label: 'Bon état' },
]
const SORT_OPTIONS = [
  { value: 'recent',     label: 'Plus récents' },
  { value: 'price_asc',  label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="cat-filter-section">
      <button className="cat-filter-section__head" onClick={() => setOpen(v => !v)}>
        <span>{title}</span>
        {open ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/>}
      </button>
      {open && <div className="cat-filter-section__body">{children}</div>}
    </div>
  )
}

// Fiche produit (card)
function ProductCard({ product }) {
  const discount = product.discount_percent
  const imgUrl   = product.main_image_url || 'https://via.placeholder.com/400x500?text=Photo'

  return (
    <Link to={`/product/${product.slug}`} className="cat-card">
      <div className="cat-card__img-wrap">
        <img src={imgUrl} alt={product.name} className="cat-card__img" loading="lazy"/>
        {discount > 0 && <span className="cat-card__badge cat-card__badge--off">-{discount}%</span>}
        <div className="cat-card__hover-overlay"><span>Voir l'article</span></div>
      </div>
      <div className="cat-card__info">
        <span className="cat-card__brand">{product.brand}</span>
        <h3 className="cat-card__name">{product.name}</h3>
        <div className="cat-card__meta">
          <span className="cat-card__tag">Taille {product.size}</span>
          <span className="cat-card__tag">{product.condition}</span>
        </div>
        <div className="cat-card__prices">
          <span className="cat-card__price">{product.price} $</span>
          {product.original_price && (
            <span className="cat-card__original">{product.original_price} $</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function CatalogueScreen() {
  const [searchParams] = useSearchParams()

  // Filters state
  const [search,     setSearch]     = useState(searchParams.get('search') || '')
  const [category,   setCategory]   = useState(searchParams.get('category') || '')
  const [sizes,      setSizes]      = useState([])
  const [conditions, setConditions] = useState([])
  const [priceMax,   setPriceMax]   = useState(200)
  const [sort,       setSort]       = useState('recent')

  // Data state
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  // UI state
  const [mobileFilters, setMobileFilters] = useState(false)

  // Debounce search
  const searchTimer = useRef(null)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  // Fetch categories once
  useEffect(() => {
    categoriesAPI.list()
      .then(({ data }) => setCategories(data))
      .catch(() => {})
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = {
      ...(category       && { category }),
      ...(sizes.length   && { size: sizes[0] }),   // backend single-value; multi filtré côté API
      ...(conditions.length && { condition: conditions[0] }),
      ...(priceMax < 200 && { max_price: priceMax }),
      ...(debouncedSearch && { search: debouncedSearch }),
      sort,
    }
    productsAPI.list(params)
      .then(({ data }) => { setProducts(data); setLoading(false) })
      .catch(() => { setError('Impossible de charger les produits.'); setLoading(false) })
  }, [category, sizes, conditions, priceMax, debouncedSearch, sort])

  const toggleArr = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])

  const resetFilters = () => {
    setSearch(''); setCategory(''); setSizes([]); setConditions([]); setPriceMax(200); setSort('recent')
  }

  const activeCount = [category, ...sizes, ...conditions].filter(Boolean).length + (priceMax < 200 ? 1 : 0)

  const FiltersPanel = () => (
    <aside className="cat-filters">
      <div className="cat-filters__head">
        <span className="cat-filters__title">
          Filtres {activeCount > 0 && <span className="cat-filters__count">{activeCount}</span>}
        </span>
        {activeCount > 0 && <button className="cat-filters__reset" onClick={resetFilters}>Effacer</button>}
      </div>

      <FilterSection title="Catégorie">
        <label className={`cat-filter-radio${!category ? ' active' : ''}`}>
          <input type="radio" name="cat" checked={!category} onChange={() => setCategory('')} />
          Tout
        </label>
        {categories.map(c => (
          <label key={c.slug} className={`cat-filter-radio${category === c.slug ? ' active' : ''}`}>
            <input type="radio" name="cat" checked={category === c.slug} onChange={() => setCategory(c.slug)} />
            {c.name}
            <span className="cat-filter-radio__count">{c.product_count}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Taille">
        <div className="cat-filter-sizes">
          {SIZES.map(s => (
            <button key={s} className={`cat-size-btn${sizes.includes(s) ? ' active' : ''}`}
              onClick={() => toggleArr(sizes, setSizes, s)}>
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Prix max">
        <div className="cat-filter-price">
          <input type="range" min={10} max={200} value={priceMax}
            onChange={e => setPriceMax(Number(e.target.value))} className="cat-price-range"/>
          <span className="cat-price-label">Jusqu'à {priceMax} $</span>
        </div>
      </FilterSection>

      <FilterSection title="État">
        {CONDITIONS.map(c => (
          <label key={c.value} className="cat-filter-check">
            <input type="checkbox" checked={conditions.includes(c.value)}
              onChange={() => toggleArr(conditions, setConditions, c.value)} />
            {c.label}
          </label>
        ))}
      </FilterSection>
    </aside>
  )

  return (
    <div className="cat-page">
      {/* Header */}
      <div className="cat-header">
        <div className="cat-header__inner">
          <div>
            <h1 className="cat-header__title">
              {category
                ? categories.find(c => c.slug === category)?.name || 'Boutique'
                : 'Boutique'}
            </h1>
            <p className="cat-header__count">
              {loading ? '...' : `${products.length} article${products.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="cat-header__right">
            <div className="cat-search-wrap">
              <FiSearch size={15} className="cat-search-ico"/>
              <input type="text" placeholder="Rechercher…" className="cat-search-input"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="cat-sort" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className="cat-filter-btn-mobile" onClick={() => setMobileFilters(true)}>
              <FiFilter size={15}/> Filtres {activeCount > 0 && <span className="cat-filters__count">{activeCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="cat-body">
        <div className="cat-filters-desktop"><FiltersPanel /></div>

        <div className="cat-grid-wrap">
          {loading ? (
            <div className="cat-loading">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="cat-skeleton" />
              ))}
            </div>
          ) : error ? (
            <div className="cat-empty">
              <p>{error}</p>
              <button className="btn-dark-outline" onClick={resetFilters}>Réessayer</button>
            </div>
          ) : products.length === 0 ? (
            <div className="cat-empty">
              <p>Aucun article ne correspond à vos filtres.</p>
              <button className="btn-dark-outline" onClick={resetFilters}>Réinitialiser les filtres</button>
            </div>
          ) : (
            <div className="cat-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFilters && (
        <div className="cat-mobile-filters">
          <div className="cat-mobile-filters__backdrop" onClick={() => setMobileFilters(false)}/>
          <div className="cat-mobile-filters__panel">
            <div className="cat-mobile-filters__head">
              <span className="cat-filters__title">Filtres</span>
              <button onClick={() => setMobileFilters(false)}><FiX size={20}/></button>
            </div>
            <div className="cat-mobile-filters__body"><FiltersPanel /></div>
            <div className="cat-mobile-filters__foot">
              <button className="btn-gold" style={{width:'100%'}} onClick={() => setMobileFilters(false)}>
                Voir {products.length} article{products.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
