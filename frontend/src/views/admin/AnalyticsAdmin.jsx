/**
 * AnalyticsAdmin — Tableau de bord analytics Google-Analytics-like
 * Données : sessions, pages vues, tunnel d'achat, sources, appareils, campagnes, pages top
 */
import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell
} from 'recharts'
import { FiUsers, FiEye, FiShoppingBag, FiPercent, FiRefreshCw, FiTrendingUp } from 'react-icons/fi'
import { adminAPI } from '../../utils/adminApi'
import './AnalyticsAdmin.css'

// ── Palette ──────────────────────────────────────────────────────────────────
const GOLD    = '#C9A84C'
const GRAY    = '#888'
const PALETTE = ['#C9A84C', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#0891b2']

// ── Format helpers ────────────────────────────────────────────────────────────
function pct(n) { return n != null ? `${n.toFixed(1)} %` : '–' }
function fmt(n) { return n != null ? n.toLocaleString('fr-CA') : '–' }

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = GOLD }) {
  return (
    <div className="ana-kpi">
      <div className="ana-kpi__icon" style={{ background: `${color}18`, color }}>
        <Icon size={20}/>
      </div>
      <div className="ana-kpi__body">
        <p className="ana-kpi__label">{label}</p>
        <p className="ana-kpi__value">{value}</p>
        {sub && <p className="ana-kpi__sub">{sub}</p>}
      </div>
    </div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="ana-tooltip">
      <p className="ana-tooltip__label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name} : <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Funnel Bar ────────────────────────────────────────────────────────────────
function FunnelStep({ label, count, pctVal, maxCount, color }) {
  const width = maxCount ? Math.max(8, (count / maxCount) * 100) : 8
  return (
    <div className="ana-funnel__step">
      <div className="ana-funnel__label">{label}</div>
      <div className="ana-funnel__bar-wrap">
        <div className="ana-funnel__bar" style={{ width: `${width}%`, background: color }}/>
      </div>
      <div className="ana-funnel__count">{fmt(count)}</div>
      {pctVal != null && (
        <div className="ana-funnel__pct" style={{ color: GRAY }}>{pct(pctVal)}</div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyticsAdmin() {
  const [days,    setDays]    = useState(30)
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = async (d) => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await adminAPI.analytics.overview(d)
      setData(res)
    } catch (e) {
      setError('Impossible de charger les données analytics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(days) }, [days])

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis   = data?.overview || {}
  const funnel = data?.funnel   || {}
  const daily  = (data?.daily_data || []).map(d => ({
    ...d,
    date: d.date?.slice(5), // "MM-DD"
  }))
  const sources   = data?.traffic_sources || []
  // Backend returns devices as dict {device_type: count} → convert to array
  const devices   = Object.entries(data?.devices || {}).map(([device, sessions]) => ({ device, sessions }))
  const topPages  = data?.top_pages       || []
  const campaigns = data?.campaigns       || []
  const recentEvents = data?.recent_events || []

  // Funnel values
  const fv = [
    { label: 'Vues produit',    key: 'view_product',    color: PALETTE[0] },
    { label: 'Ajout panier',    key: 'add_to_cart',     color: PALETTE[1] },
    { label: 'Début checkout',  key: 'begin_checkout',  color: PALETTE[2] },
    { label: 'Achats',          key: 'purchase',        color: PALETTE[3] },
  ]
  const funnelMax = fv.reduce((m, f) => Math.max(m, funnel[f.key] || 0), 0)

  return (
    <div className="ana-page">
      {/* Header */}
      <div className="ana-header">
        <div>
          <h1 className="ana-header__title">Analytiques</h1>
          <p className="ana-header__sub">Vue d'ensemble de l'activité de votre boutique</p>
        </div>
        <div className="ana-header__controls">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              className={`ana-period-btn${days === d ? ' active' : ''}`}
              onClick={() => setDays(d)}
            >
              {d}j
            </button>
          ))}
          <button className="ana-refresh" onClick={() => load(days)} title="Rafraîchir">
            <FiRefreshCw size={15}/>
          </button>
        </div>
      </div>

      {loading && (
        <div className="ana-loading">
          <div className="ana-spinner"/>
          <p>Chargement des données…</p>
        </div>
      )}

      {error && !loading && (
        <div className="ana-error">{error}</div>
      )}

      {data && !loading && (
        <>
          {/* ── KPI Cards ───────────────────────────────────────────────── */}
          <div className="ana-kpis">
            <KpiCard
              icon={FiUsers}
              label="Sessions"
              value={fmt(kpis.total_sessions)}
              sub={`${days}j glissants`}
              color="#C9A84C"
            />
            <KpiCard
              icon={FiEye}
              label="Pages vues"
              value={fmt(kpis.total_page_views)}
              sub={`Moy. ${kpis.avg_pages?.toFixed(1) ?? '–'} / session`}
              color="#2563eb"
            />
            <KpiCard
              icon={FiShoppingBag}
              label="Achats"
              value={fmt(kpis.total_purchases)}
              color="#16a34a"
            />
            <KpiCard
              icon={FiPercent}
              label="Taux de conversion"
              value={pct(kpis.conversion_rate)}
              sub="sessions → achat"
              color="#7c3aed"
            />
            <KpiCard
              icon={FiTrendingUp}
              label="Vues produit"
              value={fmt(funnel.view_product)}
              color="#0891b2"
            />
          </div>

          {/* ── Daily chart ─────────────────────────────────────────────── */}
          <div className="ana-card">
            <h2 className="ana-card__title">Sessions & Pages vues — {days} derniers jours</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={daily} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false}/>
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{ fontSize: 12 }}/>
                <Line type="monotone" dataKey="sessions"   name="Sessions"    stroke={GOLD}      strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="page_views" name="Pages vues"  stroke="#2563eb"   strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── Sources + Funnel row ────────────────────────────────────── */}
          <div className="ana-row-2">

            {/* Traffic sources */}
            <div className="ana-card">
              <h2 className="ana-card__title">Sources de trafic</h2>
              {sources.length === 0
                ? <p className="ana-empty">Aucune donnée</p>
                : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={sources} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/>
                      <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}/>
                      <YAxis type="category" dataKey="source" tick={{ fontSize: 11 }} tickLine={false} width={90}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="sessions" name="Sessions" radius={[0, 4, 4, 0]}>
                        {sources.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </div>

            {/* Conversion funnel */}
            <div className="ana-card">
              <h2 className="ana-card__title">Tunnel de conversion</h2>
              <div className="ana-funnel">
                {fv.map((f, i) => {
                  const prev = i === 0 ? null : (funnel[fv[i - 1].key] || 0)
                  const curr = funnel[f.key] || 0
                  const dropPct = prev && prev > 0 ? ((prev - curr) / prev * 100) : null
                  return (
                    <FunnelStep
                      key={f.key}
                      label={f.label}
                      count={curr}
                      pctVal={dropPct != null ? 100 - dropPct : null}
                      maxCount={funnelMax}
                      color={f.color}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Devices + Campaigns row ─────────────────────────────────── */}
          <div className="ana-row-2">

            {/* Devices */}
            <div className="ana-card">
              <h2 className="ana-card__title">Appareils</h2>
              {devices.length === 0
                ? <p className="ana-empty">Aucune donnée</p>
                : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={devices} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                      <XAxis dataKey="device" tick={{ fontSize: 11 }} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="sessions" name="Sessions" radius={[4, 4, 0, 0]}>
                        {devices.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </div>

            {/* Campaigns */}
            <div className="ana-card">
              <h2 className="ana-card__title">Campagnes UTM</h2>
              {campaigns.length === 0
                ? <p className="ana-empty">Aucune campagne tracée pour cette période</p>
                : (
                  <table className="ana-table">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Campagne</th>
                        <th>Sessions</th>
                        <th>Achats</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.slice(0, 10).map((c, i) => (
                        <tr key={i}>
                          <td>{c.utm_source || '—'}</td>
                          <td>{c.utm_campaign || '—'}</td>
                          <td>{fmt(c.sessions)}</td>
                          <td>{fmt(c.purchases)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>
          </div>

          {/* ── Top pages + Recent events row ───────────────────────────── */}
          <div className="ana-row-2">

            {/* Top pages */}
            <div className="ana-card">
              <h2 className="ana-card__title">Pages les plus visitées</h2>
              {topPages.length === 0
                ? <p className="ana-empty">Aucune donnée</p>
                : (
                  <table className="ana-table">
                    <thead>
                      <tr><th>Page</th><th>Vues</th></tr>
                    </thead>
                    <tbody>
                      {topPages.slice(0, 10).map((p, i) => (
                        <tr key={i}>
                          <td className="ana-table__page">{p.page}</td>
                          <td>{fmt(p.views)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>

            {/* Recent events */}
            <div className="ana-card">
              <h2 className="ana-card__title">Événements récents</h2>
              {recentEvents.length === 0
                ? <p className="ana-empty">Aucun événement récent</p>
                : (
                  <div className="ana-events">
                    {recentEvents.slice(0, 12).map((ev, i) => (
                      <div key={i} className="ana-event">
                        <span className={`ana-event__badge ana-event__badge--${ev.event_type}`}>
                          {ev.event_type.replace('_', ' ')}
                        </span>
                        <span className="ana-event__page">{ev.page}</span>
                        <span className="ana-event__time">{formatTime(ev.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString('fr-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}
