import { Helmet } from 'react-helmet-async'

const SITE_NAME  = 'MixMatchFrip'
const BASE_URL   = 'https://mixmatchfrip.com'
const OG_IMAGE   = `${BASE_URL}/og-image.jpg`
const TWITTER    = '@mixmatch_frip'
const DEFAULT_DESC = 'Vêtements seconde main uniques, chinés avec soin à Gatineau. Livraison partout au Canada. Trouvez la pièce rare qui révèle votre style.'

export default function SEOHead({
  title,
  description = DEFAULT_DESC,
  image        = OG_IMAGE,
  url          = '/',
  type         = 'website',
  schema,
  noindex      = false,
}) {
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — Vêtements Seconde Main | Gatineau`
  const canonicalUrl = `${BASE_URL}${url}`

  return (
    <Helmet>
      {/* Base */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow" />
      }
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:type"        content={type} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={image} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt"   content={fullTitle} />
      <meta property="og:locale"      content="fr_CA" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER} />
      <meta name="twitter:creator"     content={TWITTER} />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />

      {/* JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema, null, 0)}
        </script>
      )}
    </Helmet>
  )
}

/* ── Schémas réutilisables ─────────────────────────────────────────────────── */

export const schemaOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/logo.jpeg`,
  description: DEFAULT_DESC,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Gatineau',
    addressRegion: 'QC',
    addressCountry: 'CA',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@mixmatchfrip.com',
    contactType: 'customer service',
    availableLanguage: 'French',
  },
  sameAs: [
    'https://www.instagram.com/mixmatch_frip',
    'https://www.tiktok.com/@mixmatchfrip',
  ],
}

export const schemaWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: BASE_URL,
  inLanguage: 'fr-CA',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/catalogue?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export function schemaProduct(product, imageUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — ${product.brand}. État : ${product.condition}. Taille : ${product.size}.`,
    image: imageUrl ? [imageUrl] : [],
    brand: { '@type': 'Brand', name: product.brand || SITE_NAME },
    sku: `MMF-${product.id}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'CAD',
      availability: product.is_available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${BASE_URL}/product/${product.slug}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
    ...(product.original_price && product.discount_percent > 0 && {
      aggregateRating: undefined,
    }),
  }
}

export function schemaBreadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${BASE_URL}${item.url}` : undefined,
    })),
  }
}

export function schemaFAQ(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}
