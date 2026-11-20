import { useCallback, useEffect, useRef, useState } from 'react';

// Public data sources. Responses are cached in localStorage so that opening many tabs
// does not hit the free APIs' rate limits, and so the last value paints instantly.
const CACHE = 'sbc-cache:';

export const COINS = [
  { id: 'bitcoin', sym: 'BTC' }, { id: 'ethereum', sym: 'ETH' }, { id: 'tether', sym: 'USDT' },
  { id: 'binancecoin', sym: 'BNB' }, { id: 'solana', sym: 'SOL' }, { id: 'ripple', sym: 'XRP' },
  { id: 'the-open-network', sym: 'TON' }, { id: 'dogecoin', sym: 'DOGE' },
];
export const FIATS = ['USD', 'EUR', 'GBP', 'AED', 'OMR', 'SAR', 'TRY'];

function peek(key) {
  try { return JSON.parse(localStorage.getItem(CACHE + key) || 'null'); } catch { return null; }
}
function put(key, value) {
  try { localStorage.setItem(CACHE + key, JSON.stringify({ t: Date.now(), v: value })); } catch { /* ignore */ }
}

async function getJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const sources = {
  markets: {
    key: 'markets', ttl: 60_000,
    fetch: async signal => {
      const ids = COINS.map(c => c.id).join(',');
      const rows = await getJson(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`, signal);
      return COINS.map(c => rows.find(r => r.id === c.id)).filter(Boolean).map(r => ({
        id: r.id, sym: r.symbol.toUpperCase(), name: r.name, image: r.image, price: r.current_price, change: r.price_change_percentage_24h,
      }));
    },
  },
  fx: {
    key: 'fx', ttl: 6 * 3600_000,
    fetch: async signal => {
      const j = await getJson('https://open.er-api.com/v6/latest/USD', signal);
      if (j.result !== 'success') throw new Error('fx');
      return Object.fromEntries(FIATS.map(c => [c, j.rates[c]]));
    },
  },
  ip: {
    key: 'ip', ttl: 2 * 60_000,
    fetch: async signal => getJson('https://api.country.is/', signal),
  },
};

export function weatherSource(city, unit) {
  return {
    key: `weather:${city.lat.toFixed(2)},${city.lon.toFixed(2)},${unit}`, ttl: 15 * 60_000,
    fetch: async signal => {
      const q = new URLSearchParams({
        latitude: city.lat, longitude: city.lon, timezone: 'auto', forecast_days: '5', temperature_unit: unit, wind_speed_unit: 'kmh',
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      });
      return getJson(`https://api.open-meteo.com/v1/forecast?${q}`, signal);
    },
  };
}

// Company news from SBC's own RSS feed (English; the server allows cross-origin reads).
export const NEWS_FEED = { rss: 'https://sbc.om/news/rss.xml', site: 'https://sbc.om/news/' };

export const newsSource = {
  key: 'news:sbc', ttl: 15 * 60_000,
  fetch: async signal => {
    const res = await fetch(NEWS_FEED.rss, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/xml');
    const text = (item, tag) => item.querySelector(tag)?.textContent?.trim() || '';
    return [...doc.querySelectorAll('item')].slice(0, 10).map(item => ({
      title: text(item, 'title'),
      link: text(item, 'link') || NEWS_FEED.site,
      date: text(item, 'pubDate') || null,
    })).filter(i => i.title && /^https:\/\//.test(i.link));
  },
};

export async function geocode(name, lang, signal) {
  const q = new URLSearchParams({ name, count: '6', language: lang, format: 'json' });
  const j = await getJson(`https://geocoding-api.open-meteo.com/v1/search?${q}`, signal);
  return (j.results || []).map(r => ({ name: r.name, country: r.country, admin: r.admin1, lat: r.latitude, lon: r.longitude }));
}

// Subscribe a component to a cached remote source. Returns the freshest value we have,
// refreshes it when stale, and keeps polling every `poll` ms while mounted.
export function useRemote(source, { poll = 0, enabled = true } = {}) {
  const key = source?.key;
  const [state, setState] = useState(() => {
    const hit = key && peek(key);
    return { data: hit ? hit.v : null, error: null, loading: false, at: hit ? hit.t : 0 };
  });
  const sourceRef = useRef(source);
  sourceRef.current = source;

  const refresh = useCallback(async (force = false) => {
    const src = sourceRef.current;
    if (!src) return;
    const hit = peek(src.key);
    if (!force && hit && Date.now() - hit.t < src.ttl) {
      setState({ data: hit.v, error: null, loading: false, at: hit.t });
      return;
    }
    setState(s => ({ ...s, loading: true }));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const value = await src.fetch(controller.signal);
      put(src.key, value);
      if (sourceRef.current?.key === src.key) setState({ data: value, error: null, loading: false, at: Date.now() });
    } catch (error) {
      if (sourceRef.current?.key === src.key) setState(s => ({ ...s, error, loading: false }));
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !key) return undefined;
    const hit = peek(key);
    setState({ data: hit ? hit.v : null, error: null, loading: false, at: hit ? hit.t : 0 });
    refresh();
    if (!poll) return undefined;
    const id = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, poll);
    return () => clearInterval(id);
  }, [key, enabled, poll, refresh]);

  return { ...state, refresh };
}

// Formatting helpers for prices (always Latin digits, like most exchanges show them).
export function usd(v) {
  if (v == null || !Number.isFinite(v)) return '—';
  const digits = v >= 1000 ? 0 : v >= 1 ? 2 : 4;
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits === 0 ? 0 : Math.min(2, digits) });
}
export function pct(v) {
  if (v == null || !Number.isFinite(v)) return '';
  const r = Math.abs(v) >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
  return (r > 0 ? '+' : '') + r + '%';
}
