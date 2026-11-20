import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning,
  Droplets, Wind, Thermometer, MapPin, Search, ExternalLink, Plus, Trash2, X, ArrowLeftRight, Play, Pause,
  RotateCcw, ChevronLeft, ChevronRight, Copy, RefreshCw, Newspaper, CalendarDays, Clock3, Coins, BellRing,
  LocateFixed, ClipboardList, NotebookPen, Bookmark, Settings, Check, Globe,
} from 'lucide-react';
import { useI18n, cityName, CITIES } from './i18n';
import { useRemote, sources, weatherSource, newsSource, geocode, COINS, FIATS, usd, pct, NEWS_FEED } from './api';
import { uid, WIDGETS, resetAll } from './store';
import { altDates, monthGrid, relativeTime, tzOffsetMinutes, clockTime } from './dates';
import { WALLPAPERS } from './wallpapers';
import { BRAND } from './brand-icons';
import manifest from '../manifest.json';

export const VERSION = manifest.version;
export const ConfigContext = createContext(null);
export const useCfg = () => useContext(ConfigContext);

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

// Persian/Arabic-Indic digits typed by the user become Latin digits before parsing.
export const toLatin = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[,٬]/g, '').replace('٫', '.');
export const flagEmoji = code => (/^[A-Z]{2}$/i.test(code || '') ? String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1f1a5 + c.charCodeAt(0))) : '🌐');
export const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

export function BrandGlyph({ name, size = 20, color }) {
  const b = BRAND[name];
  if (!b) return null;
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill={color || b.color}><path d={b.path} /></svg>;
}

function useDir() {
  const { dir } = useI18n();
  return dir === 'rtl' ? { Back: ChevronRight, Fwd: ChevronLeft } : { Back: ChevronLeft, Fwd: ChevronRight };
}

function Status({ error, onRetry }) {
  const { t } = useI18n();
  if (!error) return <div className="empty"><span className="spinner" aria-hidden="true" />{t('loading')}</div>;
  return <div className="empty"><p>{error}</p>{onRetry && <button className="btn ghost sm" onClick={onRetry}><RefreshCw size={14} />{t('retry')}</button>}</div>;
}

function Segmented({ value, options, onChange, label }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(o => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Weather */

export function wxInfo(code, isDay = 1) {
  if (code === 0) return { key: 'clear', Icon: isDay ? Sun : Moon, tone: isDay ? 'sun' : 'moon' };
  if (code <= 2) return { key: 'mostlyClear', Icon: isDay ? CloudSun : CloudMoon, tone: isDay ? 'sun' : 'moon' };
  if (code === 3) return { key: 'cloudy', Icon: Cloud, tone: 'cloud' };
  if (code === 45 || code === 48) return { key: 'fog', Icon: CloudFog, tone: 'cloud' };
  if (code >= 51 && code <= 57) return { key: 'drizzle', Icon: CloudDrizzle, tone: 'rain' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { key: 'rain', Icon: CloudRain, tone: 'rain' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { key: 'snow', Icon: CloudSnow, tone: 'snow' };
  if (code >= 95) return { key: 'storm', Icon: CloudLightning, tone: 'storm' };
  return { key: 'cloudy', Icon: Cloud, tone: 'cloud' };
}

export function useWeather(enabled = true) {
  const { config } = useCfg();
  const { lat, lon } = config.city;
  const src = useMemo(() => weatherSource({ lat, lon }, config.unit), [lat, lon, config.unit]);
  return useRemote(src, { poll: 15 * 60_000, enabled });
}

function CitySearch({ onPick, onCancel }) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  useEffect(() => {
    if (q.trim().length < 2) { setResults(null); return undefined; }
    const controller = new AbortController();
    const id = setTimeout(() => {
      geocode(q.trim(), lang, controller.signal).then(setResults).catch(e => { if (e.name !== 'AbortError') setResults([]); });
    }, 350);
    return () => { clearTimeout(id); controller.abort(); };
  }, [q, lang]);
  return (
    <div className="city-search">
      <div className="input-icon"><Search size={16} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={t('searchCity')} aria-label={t('searchCity')} /></div>
      <div className="city-results">
        {results?.length === 0 && <div className="empty sm">{t('noCity')}</div>}
        {results?.map(r => (
          <button key={`${r.lat},${r.lon}`} className="list-btn" onClick={() => onPick({ name: r.name, lat: r.lat, lon: r.lon })}>
            <MapPin size={15} /><span><b>{r.name}</b><small>{[r.admin, r.country].filter(Boolean).join('، ')}</small></span>
          </button>
        ))}
      </div>
      <button className="btn ghost sm" onClick={onCancel}>{t('cancel')}</button>
    </div>
  );
}

export function WeatherPanel() {
  const { config, update } = useCfg();
  const { t, num, locale } = useI18n();
  const { data, error, refresh } = useWeather(true);
  const [editing, setEditing] = useState(false);
  if (editing) return <CitySearch onPick={city => { update({ city }); setEditing(false); }} onCancel={() => setEditing(false)} />;
  const cur = data?.current;
  const deg = config.unit === 'fahrenheit' ? '°F' : '°C';
  const info = cur ? wxInfo(cur.weather_code, cur.is_day) : null;
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  return (
    <>
      <div className="wx-now">
        {cur ? (
          <>
            <div className={`wx-icon tone-${info.tone}`}><info.Icon size={42} strokeWidth={1.5} /></div>
            <div className="wx-main">
              <div className="wx-temp">{num(Math.round(cur.temperature_2m))}<small>{deg}</small></div>
              <div className="wx-label">{t(`wx.${info.key}`)}</div>
            </div>
          </>
        ) : <Status error={error && t('weatherError')} onRetry={() => refresh(true)} />}
        <button className="chip-btn wx-city" onClick={() => setEditing(true)} title={t('changeCity')}><MapPin size={14} />{config.city.name}</button>
      </div>
      {cur && (
        <div className="stats">
          <div><Thermometer size={15} /><small>{t('feelsLike')}</small><b>{num(Math.round(cur.apparent_temperature))}°</b></div>
          <div><Droplets size={15} /><small>{t('humidity')}</small><b>{num(cur.relative_humidity_2m)}٪</b></div>
          <div><Wind size={15} /><small>{t('wind')}</small><b>{num(Math.round(cur.wind_speed_10m))} <span className="unit">{t('kmh')}</span></b></div>
        </div>
      )}
      {data?.daily && (
        <div className="wx-days">
          {data.daily.time.map((d, i) => {
            const [y, m, dd] = d.split('-').map(Number);
            const day = wxInfo(data.daily.weather_code[i], 1);
            return (
              <div className="wx-day" key={d}>
                <span>{i === 0 ? t('today') : weekday.format(new Date(y, m - 1, dd))}</span>
                <day.Icon size={20} strokeWidth={1.6} className={`tone-${day.tone}`} />
                <b>{num(Math.round(data.daily.temperature_2m_max[i]))}°</b>
                <small>{num(Math.round(data.daily.temperature_2m_min[i]))}°</small>
              </div>
            );
          })}
        </div>
      )}
      <p className="fine">{t('weatherSource')}</p>
    </>
  );
}

/* ---------------------------------------------------------------- News */

export function NewsPanel() {
  const { lang, t } = useI18n();
  const { data, error, refresh } = useRemote(newsSource, { poll: 15 * 60_000 });
  if (!data?.length) {
    if (!error) return <Status />;
    return (
      <div className="empty">
        <p>{t('newsError')}</p>
        <a className="btn ghost sm" href={NEWS_FEED.site} target="_blank" rel="noopener noreferrer">{t('newsSource')}<ExternalLink size={14} /></a>
        <button className="btn ghost sm" onClick={() => refresh(true)}><RefreshCw size={14} />{t('retry')}</button>
      </div>
    );
  }
  return (
    <>
      <ul className="news-list">
        {data.slice(0, 8).map(item => (
          <li key={item.link}>
            <a href={item.link} target="_blank" rel="noopener noreferrer" title={item.title}>
              <span className="news-title" dir="auto">{item.title}</span>
              {item.date && <span className="news-time">{relativeTime(item.date, lang)}</span>}
            </a>
          </li>
        ))}
      </ul>
      <div className="pop-foot"><span>{t('newsSource')}</span><a href={NEWS_FEED.site} target="_blank" rel="noopener noreferrer">{t('openSite')}<ExternalLink size={12} /></a></div>
    </>
  );
}

/* ---------------------------------------------------------------- Markets */

export function useMarkets(enabled = true) {
  return useRemote(sources.markets, { poll: 60_000, enabled });
}

// Display symbol: the live one from CoinGecko when known, otherwise our fallback.
export const coinSym = (id, data) => data?.find(c => c.id === id)?.sym || COINS.find(c => c.id === id)?.sym || id;

export function MarketsPanel() {
  const { config, update } = useCfg();
  const { t } = useI18n();
  const { data, error, refresh } = useMarkets();
  if (!data) return <Status error={error && t('marketsError')} onRetry={() => refresh(true)} />;
  return (
    <>
      <div className="mk-list">
        {data.map(c => (
          <button key={c.id} className={`mk-row ${config.ticker === c.id ? 'on' : ''}`} onClick={() => update({ ticker: c.id })} aria-pressed={config.ticker === c.id}>
            <img src={c.image} width="26" height="26" alt="" loading="lazy" />
            <span className="mk-name"><b>{c.sym}</b><small>{c.name}</small></span>
            <span className="mk-price" dir="ltr">{usd(c.price)}</span>
            <span className={`chg ${c.change >= 0 ? 'up' : 'down'}`} dir="ltr">{pct(c.change)}</span>
          </button>
        ))}
      </div>
      <p className="fine">{t('pinHint')} {t('marketsSource')}</p>
    </>
  );
}

/* ---------------------------------------------------------------- Price alerts */

export function AlertsPanel() {
  const { config, update } = useCfg();
  const { t } = useI18n();
  const { data } = useMarkets();
  const [coin, setCoin] = useState('bitcoin');
  const [dir, setDir] = useState('above');
  const [price, setPrice] = useState('');
  const current = data?.find(c => c.id === coin)?.price;
  const add = e => {
    e.preventDefault();
    const p = parseFloat(toLatin(price));
    if (!(p > 0)) return;
    update(c => ({ alerts: [...c.alerts, { id: uid(), coin, dir, price: p, hit: false }] }));
    setPrice('');
  };
  const sym = id => coinSym(id, data);
  return (
    <>
      <form className="alert-form" onSubmit={add}>
        <select value={coin} onChange={e => setCoin(e.target.value)} aria-label="Coin">{COINS.map(c => <option key={c.id} value={c.id}>{coinSym(c.id, data)}</option>)}</select>
        <select value={dir} onChange={e => setDir(e.target.value)} aria-label="Condition"><option value="above">{t('above')}</option><option value="below">{t('below')}</option></select>
        <input dir="ltr" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder={t('pricePlaceholder')} aria-label={t('pricePlaceholder')} />
        <button className="btn primary icon" type="submit" aria-label={t('add')}><Plus size={18} /></button>
      </form>
      {current != null && <button type="button" className="hint-btn" onClick={() => setPrice(String(current))}>{sym(coin)} <span dir="ltr">{usd(current)}</span></button>}
      <div className="alert-list">
        {config.alerts.length === 0 && <div className="empty sm">{t('noAlerts')}</div>}
        {config.alerts.map(a => (
          <div key={a.id} className={`alert-row ${a.hit ? 'hit' : ''}`}>
            <BellRing size={16} />
            <span><b>{sym(a.coin)}</b> {t(a.dir)} <span dir="ltr">{usd(a.price)}</span></span>
            {a.hit && <span className="tag ok"><Check size={12} />{t('triggered')}</span>}
            <button className="icon-btn" onClick={() => update(c => ({ alerts: c.alerts.filter(x => x.id !== a.id) }))} aria-label={t('remove')}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <p className="fine">{t('alertsHint')}</p>
    </>
  );
}

/* ---------------------------------------------------------------- Converter */

export function ConverterPanel() {
  const { t } = useI18n();
  const markets = useMarkets();
  const fx = useRemote(sources.fx);
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('bitcoin');
  const [to, setTo] = useState('USD');
  // Coins are keyed by CoinGecko id (symbols can change); fiat currencies by ISO code.
  const units = [...COINS.map(c => c.id), ...FIATS];
  const isCoin = u => COINS.some(c => c.id === u);
  const label = u => (isCoin(u) ? coinSym(u, markets.data) : u);
  const usdPer = u => {
    if (u === 'USD') return 1;
    if (isCoin(u)) return markets.data?.find(c => c.id === u)?.price;
    const r = fx.data?.[u];
    return r ? 1 / r : undefined;
  };
  const a = parseFloat(toLatin(amount));
  const rate = usdPer(from) / usdPer(to);
  const value = a * rate;
  const fmt = (v, unit) => {
    if (!Number.isFinite(v)) return '—';
    const max = isCoin(unit) ? (v < 1 ? 8 : 6) : unit === 'OMR' ? 3 : 2;
    return v.toLocaleString('en-US', { maximumFractionDigits: max });
  };
  const loading = (!markets.data && !markets.error) || (!fx.data && !fx.error);
  const options = units.map(u => <option key={u} value={u}>{label(u)}</option>);
  return (
    <div className="conv">
      <label className="field"><span>{t('amount')}</span><input dir="ltr" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /></label>
      <div className="conv-row">
        <select value={from} onChange={e => setFrom(e.target.value)} aria-label="From">{options}</select>
        <button type="button" className="icon-btn ring" onClick={() => { setFrom(to); setTo(from); }} aria-label={t('swap')}><ArrowLeftRight size={16} /></button>
        <select value={to} onChange={e => setTo(e.target.value)} aria-label="To">{options}</select>
      </div>
      <div className="conv-result" dir="ltr">{loading ? <span className="spinner" /> : <><b>{fmt(value, to)}</b><span>{label(to)}</span></>}</div>
      {Number.isFinite(rate) && <div className="fine center" dir="ltr">1 {label(from)} = {fmt(rate, to)} {label(to)}</div>}
      <p className="fine">{t('converterSource')}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- Focus timer */

export function focusState(focus, now) {
  if (focus.endAt) return { mode: 'running', left: Math.max(0, focus.endAt - now) };
  if (focus.remaining != null) return { mode: 'paused', left: focus.remaining };
  return { mode: 'idle', left: focus.minutes * 60_000 };
}

export function FocusPanel() {
  const { config, update } = useCfg();
  const { t, num } = useI18n();
  const now = useNow(500);
  const f = config.focus;
  const { mode, left } = focusState(f, now.getTime());
  const total = f.minutes * 60_000;
  const progress = mode === 'idle' ? 0 : 1 - left / total;
  const set = patch => update(c => ({ focus: { ...c.focus, ...patch } }));
  const r = 54, circ = 2 * Math.PI * r;
  return (
    <div className="focus">
      <div className="focus-ring">
        <svg viewBox="0 0 128 128" aria-hidden="true">
          <circle cx="64" cy="64" r={r} className="track" />
          <circle cx="64" cy="64" r={r} className="bar" strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} />
        </svg>
        <div className="focus-time" dir="ltr">{mmss(left)}</div>
      </div>
      <div className="focus-presets">
        {[15, 25, 45, 60].map(m => (
          <button key={m} disabled={mode !== 'idle'} className={f.minutes === m ? 'on' : ''} onClick={() => set({ minutes: m })}>{num(m)} {t('minutes')}</button>
        ))}
      </div>
      <div className="focus-actions">
        {mode === 'idle' && <button className="btn primary" onClick={() => set({ endAt: Date.now() + total, remaining: null })}><Play size={16} />{t('start')}</button>}
        {mode === 'running' && <button className="btn primary" onClick={() => set({ endAt: null, remaining: f.endAt - Date.now() })}><Pause size={16} />{t('pause')}</button>}
        {mode === 'paused' && <button className="btn primary" onClick={() => set({ endAt: Date.now() + f.remaining, remaining: null })}><Play size={16} />{t('resume')}</button>}
        {mode !== 'idle' && <button className="btn ghost" onClick={() => set({ endAt: null, remaining: null })}><RotateCcw size={16} />{t('reset')}</button>}
      </div>
      <p className="fine center">{mode === 'idle' ? t('focusIdle') : t('focusHint')}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- Tasks */

export function TasksPanel() {
  const { config, update } = useCfg();
  const { t, num } = useI18n();
  const [text, setText] = useState('');
  const [prio, setPrio] = useState('mid');
  const add = e => {
    e.preventDefault();
    if (!text.trim()) return;
    update(c => ({ tasks: [{ id: uid(), text: text.trim(), done: false, priority: prio }, ...c.tasks] }));
    setText('');
  };
  const tasks = [...config.tasks].sort((a, b) => Number(a.done) - Number(b.done));
  const left = config.tasks.filter(x => !x.done).length;
  return (
    <>
      <div className="task-list">
        {tasks.length === 0 && <div className="empty sm">{t('noTasks')}</div>}
        {tasks.map(task => (
          <div key={task.id} className={`task ${task.done ? 'done' : ''}`}>
            <input type="checkbox" checked={task.done} aria-label={task.text} onChange={() => update(c => ({ tasks: c.tasks.map(x => (x.id === task.id ? { ...x, done: !x.done } : x)) }))} />
            <div className="task-body">
              <span className="task-text">{task.text}</span>
              <span className={`prio prio-${task.priority || 'mid'}`}>{t(`priority.${task.priority || 'mid'}`)}</span>
            </div>
            <button className="icon-btn" onClick={() => update(c => ({ tasks: c.tasks.filter(x => x.id !== task.id) }))} aria-label={t('remove')}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <form className="task-form" onSubmit={add}>
        <div className="prio-pick" role="radiogroup" aria-label="Priority">
          {['high', 'mid', 'low'].map(p => <button type="button" key={p} role="radio" aria-checked={prio === p} title={t(`priority.${p}`)} className={`dot prio-${p} ${prio === p ? 'on' : ''}`} onClick={() => setPrio(p)} />)}
        </div>
        <input value={text} onChange={e => setText(e.target.value)} placeholder={t('addTask')} aria-label={t('addTask')} maxLength={140} />
        <button className="btn primary icon" type="submit" aria-label={t('add')}><Plus size={18} /></button>
      </form>
      {config.tasks.length > 0 && (
        <div className="pop-foot">
          <span>{t('tasksLeft', { n: num(left) })}</span>
          {config.tasks.some(x => x.done) && <button className="link" onClick={() => update(c => ({ tasks: c.tasks.filter(x => !x.done) }))}>{t('clearDone')}</button>}
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- Notes */

export function NotesPanel() {
  const { config, update } = useCfg();
  const { t, num } = useI18n();
  return (
    <>
      <textarea className="notes" value={config.notes} onChange={e => update({ notes: e.target.value })} placeholder={t('notesPlaceholder')} aria-label={t('notes')} maxLength={5000} />
      <div className="pop-foot"><span>{t('notesSaved')}</span><span>{num(config.notes.length)} / {num(5000)}</span></div>
    </>
  );
}

/* ---------------------------------------------------------------- Calendar */

export function CalendarPanel() {
  const { t, lang } = useI18n();
  const { Back, Fwd } = useDir();
  const now = useNow(60_000);
  const [cal, setCal] = useState(lang === 'fa' ? 'persian' : 'gregory');
  const [offset, setOffset] = useState(0);
  const dayKey = now.toDateString();
  const grid = useMemo(() => monthGrid(cal, offset, lang, now), [cal, offset, lang, dayKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const alt = altDates(now, lang);
  return (
    <div className="cal">
      <div className="cal-side">
        <div className="cal-alt">
          {[['jalali', alt.jalali], ['gregorian', alt.gregorian], ['hijri', alt.hijri]].map(([k, v]) => <div key={k}><small>{t(k)}</small><b>{v}</b></div>)}
        </div>
        <Segmented value={cal} onChange={v => { setCal(v); setOffset(0); }} options={[{ value: 'persian', label: t('jalali') }, { value: 'gregory', label: t('gregorian') }]} />
      </div>
      <div className="cal-main">
        <div className="cal-head">
          <button className="icon-btn" onClick={() => setOffset(offset - 1)} aria-label="Previous month"><Back size={18} /></button>
          <b>{grid.title}</b>
          {offset !== 0 && <button className="link" onClick={() => setOffset(0)}>{t('today')}</button>}
          <button className="icon-btn" onClick={() => setOffset(offset + 1)} aria-label="Next month"><Fwd size={18} /></button>
        </div>
        <div className="cal-grid">
          {grid.weekdays.map((w, i) => <small key={`w${i}`}>{w}</small>)}
          {Array.from({ length: grid.lead }, (_, i) => <span key={`b${i}`} />)}
          {grid.days.map(d => <span key={d.date.toISOString()} className={`${d.today ? 'today' : ''} ${d.weekend ? 'weekend' : ''}`}>{d.label}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- World clock */

export function WorldClockPanel() {
  const { config, update } = useCfg();
  const { t, lang, num } = useI18n();
  const now = useNow(1000);
  const offsetLabel = tz => {
    const m = tzOffsetMinutes(tz, now);
    if (m === 0) return t('localTime');
    const sign = m > 0 ? '+' : '−';
    const h = Math.floor(Math.abs(m) / 60), mm = Math.abs(m) % 60;
    return `${sign}${num(h)}${mm ? ':' + num(mm, { minimumIntegerDigits: 2 }) : ''}`;
  };
  const available = CITIES.filter(c => !config.worldClocks.includes(c[0]));
  return (
    <>
      <div className="wc-list">
        {config.worldClocks.map(tz => (
          <div className="wc-row" key={tz}>
            <span className="wc-city"><b>{cityName(tz, lang)}</b><small dir="auto">{offsetLabel(tz)}</small></span>
            <b className="wc-time" dir="ltr">{clockTime(now, tz)}</b>
            <button className="icon-btn" onClick={() => update(c => ({ worldClocks: c.worldClocks.filter(x => x !== tz) }))} aria-label={t('remove')}><X size={15} /></button>
          </div>
        ))}
      </div>
      {available.length > 0 && (
        <select className="full" value="" onChange={e => e.target.value && update(c => ({ worldClocks: [...c.worldClocks, e.target.value] }))} aria-label={t('addCity')}>
          <option value="">{t('addCity')}</option>
          {available.map(c => <option key={c[0]} value={c[0]}>{lang === 'fa' ? c[1] : c[2]}</option>)}
        </select>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- Shortcuts */

function Favicon({ url, title }) {
  const [failed, setFailed] = useState(false);
  let host = '';
  try { host = new URL(url).hostname; } catch { /* invalid */ }
  if (failed || !host) return <span className="fav-letter">{(title || host || '?').trim().charAt(0).toUpperCase()}</span>;
  return <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`} alt="" width="28" height="28" onError={() => setFailed(true)} />;
}

export function ShortcutsPanel() {
  const { config, update } = useCfg();
  const { t } = useI18n();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const submit = e => {
    e.preventDefault();
    let u = url.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    try {
      const parsed = new URL(u);
      if (!/^https?:$/.test(parsed.protocol)) return;
      update(c => ({ links: [...c.links, { id: uid(), title: title.trim() || parsed.hostname.replace(/^www\./, ''), url: parsed.href }] }));
      setTitle(''); setUrl(''); setAdding(false);
    } catch { /* invalid URL: keep the form open */ }
  };
  return (
    <>
      <div className="sc-grid">
        {config.links.map(l => (
          <div className="sc-tile" key={l.id}>
            <a href={l.url} title={l.url}><span className="sc-icon"><Favicon url={l.url} title={l.title} /></span><span className="sc-title">{l.title}</span></a>
            <button className="sc-remove" onClick={() => update(c => ({ links: c.links.filter(x => x.id !== l.id) }))} aria-label={`${t('remove')} ${l.title}`}><X size={12} /></button>
          </div>
        ))}
        {!adding && <button className="sc-tile sc-add" onClick={() => setAdding(true)}><span className="sc-icon"><Plus size={22} /></span><span className="sc-title">{t('addShortcut')}</span></button>}
      </div>
      {adding && (
        <form className="sc-form" onSubmit={submit}>
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder={t('shortcutTitle')} aria-label={t('shortcutTitle')} maxLength={40} />
          <input dir="ltr" value={url} onChange={e => setUrl(e.target.value)} placeholder="example.com" aria-label={t('shortcutUrl')} />
          <div className="row-actions"><button type="button" className="btn ghost sm" onClick={() => setAdding(false)}>{t('cancel')}</button><button className="btn primary sm" type="submit">{t('save')}</button></div>
        </form>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- IP */

export function IpPanel({ ip }) {
  const { t, lang } = useI18n();
  const online = useOnline();
  const [copied, setCopied] = useState(false);
  const own = useRemote(sources.ip, { enabled: !ip });
  const state = ip || own;
  const data = state.data;
  let country = data?.country || '';
  try { if (country) country = new Intl.DisplayNames([lang], { type: 'region' }).of(country) || country; } catch { /* unknown code */ }
  const copy = async () => {
    try { await navigator.clipboard.writeText(data.ip); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ }
  };
  if (!data) return <Status error={state.error && t('ipError')} onRetry={() => state.refresh(true)} />;
  return (
    <>
      <div className="ip-big"><span className="flag" aria-hidden="true">{flagEmoji(data.country)}</span><b dir="ltr">{data.ip}</b></div>
      <div className="stats two">
        <div><Globe size={15} /><small>{t('country')}</small><b>{country}</b></div>
        <div><span className={`status-dot ${online ? 'on' : 'off'}`} /><small>{t('yourIp')}</small><b>{online ? t('online') : t('offline')}</b></div>
      </div>
      <div className="row-actions">
        <button className="btn ghost sm" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copyIp')}</button>
        <button className="btn ghost sm" onClick={() => state.refresh(true)} disabled={state.loading}><RefreshCw size={14} className={state.loading ? 'spin' : ''} />{t('refresh')}</button>
      </div>
      <p className="fine">{t('ipSource')}</p>
    </>
  );
}

/* ---------------------------------------------------------------- Settings */

export function SettingsPanel() {
  const { config, update } = useCfg();
  const { t, lang } = useI18n();
  const cityOptions = CITIES.map(c => <option key={c[0]} value={c[0]}>{lang === 'fa' ? c[1] : c[2]}</option>);
  return (
    <div className="settings">
      <section>
        <h4>{t('language')}</h4>
        <Segmented value={config.lang} onChange={v => update({ lang: v })} options={[{ value: 'fa', label: 'فارسی' }, { value: 'en', label: 'English' }]} label={t('language')} />
      </section>
      <section>
        <h4>{t('clockCities')}</h4>
        <div className="two-col">
          {[0, 1].map(i => (
            <select key={i} value={config.clocks[i]} onChange={e => update(c => { const clocks = [...c.clocks]; clocks[i] = e.target.value; return { clocks }; })} aria-label={`${t('clockCities')} ${i + 1}`}>{cityOptions}</select>
          ))}
        </div>
      </section>
      <section>
        <h4>{t('searchEngine')}</h4>
        <Segmented value={config.search} onChange={v => update({ search: v })} label={t('searchEngine')}
          options={['google', 'duckduckgo', 'bing'].map(k => ({ value: k, label: t(`engines.${k}`), icon: <BrandGlyph name={k} size={14} color="currentColor" /> }))} />
      </section>
      <section>
        <h4>{t('tempUnit')}</h4>
        <Segmented value={config.unit} onChange={v => update({ unit: v })} options={[{ value: 'celsius', label: `${t('celsius')} ⁦°C⁩` }, { value: 'fahrenheit', label: `${t('fahrenheit')} ⁦°F⁩` }]} label={t('tempUnit')} />
      </section>
      <section>
        <h4>{t('wallpaper')}</h4>
        <div className="wp-thumbs">
          {WALLPAPERS.map(w => (
            <button key={w.id} className={config.wallpaper === w.id ? 'on' : ''} style={{ backgroundImage: `url(${w.url})` }} onClick={() => update({ wallpaper: w.id })} aria-pressed={config.wallpaper === w.id}>
              <span>{t(`wallpapers.${w.id}`)}</span>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h4>{t('widgets')}</h4>
        <div className="switches">
          {WIDGETS.map(w => (
            <label key={w} className="switch-row">
              <span>{t(`widgetNames.${w}`)}</span>
              <input type="checkbox" role="switch" checked={config.show[w]} onChange={e => update(c => ({ show: { ...c.show, [w]: e.target.checked } }))} />
              <span className="switch" aria-hidden="true" />
            </label>
          ))}
        </div>
      </section>
      <section className="settings-foot">
        <p className="fine">{t('privacyNote')}</p>
        <div className="row-actions spread">
          <span className="fine">{t('version')} <span dir="ltr">{VERSION}</span> · <a href="https://sbc.om" target="_blank" rel="noopener noreferrer">{t('website')}</a></span>
          <button className="btn danger sm" onClick={() => { if (window.confirm(t('resetConfirm'))) { resetAll(); window.location.reload(); } }}>{t('resetAll')}</button>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- Tools launcher */

export const TOOLS = [
  { key: 'weather', Icon: CloudSun, label: 'weather', Panel: WeatherPanel },
  { key: 'news', Icon: Newspaper, label: 'news', Panel: NewsPanel },
  { key: 'calendar', Icon: CalendarDays, label: 'calendar', Panel: CalendarPanel },
  { key: 'worldClock', Icon: Clock3, label: 'worldClock', Panel: WorldClockPanel },
  { key: 'markets', Icon: Coins, label: 'markets', Panel: MarketsPanel },
  { key: 'converter', Icon: ArrowLeftRight, label: 'converter', Panel: ConverterPanel },
  { key: 'alerts', Icon: BellRing, label: 'priceAlert', Panel: AlertsPanel },
  { key: 'focus', Icon: LocateFixed, label: 'focus', Panel: FocusPanel },
  { key: 'tasks', Icon: ClipboardList, label: 'myTasks', Panel: TasksPanel },
  { key: 'notes', Icon: NotebookPen, label: 'notes', Panel: NotesPanel },
  { key: 'shortcuts', Icon: Bookmark, label: 'shortcuts', Panel: ShortcutsPanel },
  { key: 'settings', Icon: Settings, label: 'settings', Panel: SettingsPanel },
];

export function ToolsLauncher({ onOpen }) {
  const { t } = useI18n();
  const first = useRef(null);
  useEffect(() => { first.current?.focus(); }, []);
  return (
    <div className="launcher">
      {TOOLS.map(({ key, Icon, label }, i) => (
        <button key={key} ref={i === 0 ? first : undefined} onClick={() => onOpen(key)}>
          <span className="launcher-icon"><Icon size={22} strokeWidth={1.7} /></span>
          <span>{t(label)}</span>
        </button>
      ))}
    </div>
  );
}
