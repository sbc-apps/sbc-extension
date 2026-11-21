import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimateUIProvider } from '@animate-ui/react/provider';
import { motion, AnimatePresence } from 'motion/react';
import {
  Grip, Newspaper, LocateFixed, Bell, ArrowLeftRight, ClipboardList, NotebookPen, Settings, Bookmark,
  ChevronDown, ChevronLeft, ChevronRight, Play, Pause, X, CloudSun, BellRing, Search,
} from 'lucide-react';
import '@fontsource-variable/vazirmatn';
import '@fontsource-variable/inter';
import './newtab.css';
import { makeI18n, I18nContext, useI18n, cityName } from './i18n';
import { useConfig } from './store';
import { submitSearch } from './search';
import { COINS, sources, useRemote, usd, pct } from './api';
import { clockTime, fullDate } from './dates';
import { wallpaperById, stepWallpaper } from './wallpapers';
import {
  ConfigContext, useCfg, useNow, useOnline, useMarkets, coinSym, useWeather, wxInfo, focusState, mmss, flagEmoji,
  TOOLS, ToolsLauncher, WeatherPanel, NewsPanel, MarketsPanel, AlertsPanel, ConverterPanel, FocusPanel, TasksPanel,
  NotesPanel, CalendarPanel, ShortcutsPanel, IpPanel, SettingsPanel,
} from './panels';

const PopContext = createContext({ open: null, setOpen: () => {} });

/* A bar button that toggles an anchored glass popover. Only one popover is open at a time. */
function Pop({ id, label, title, align = 'start', up = false, width = 340, className = '', btnClass = '', ariaLabel, children }) {
  const { open, setOpen } = useContext(PopContext);
  const ref = useRef(null);
  const isOpen = open === id;
  const [maxH, setMaxH] = useState(null);
  // Fit the panel into the space between its button and the screen edge.
  useLayoutEffect(() => {
    if (!isOpen || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setMaxH(Math.max(200, Math.min(640, (up ? r.top : window.innerHeight - r.bottom) - 22)));
  }, [isOpen, up]);
  useEffect(() => {
    if (!isOpen) return undefined;
    const onDown = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [isOpen, setOpen]);
  return (
    <div className={`pop ${className}`} ref={ref}>
      <button type="button" className={`bar-btn ${btnClass} ${isOpen ? 'is-open' : ''}`} aria-expanded={isOpen} aria-haspopup="dialog" aria-label={ariaLabel} onClick={() => setOpen(isOpen ? null : id)}>
        {label}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`pop-panel pop-${align} ${up ? 'pop-up' : 'pop-down'}`} style={{ '--w': `${width}px`, maxHeight: maxH || undefined }} role="dialog" aria-label={title || ariaLabel}
            initial={{ opacity: 0, y: up ? 8 : -8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: up ? 6 : -6, scale: .98 }}
            transition={{ duration: .16, ease: [.2, .8, .2, 1] }}
          >
            {title && <div className="pop-head"><b>{title}</b></div>}
            <div className="pop-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const withSeparators = items => items.filter(Boolean).flatMap((el, i) => (i ? [<span className="sep" key={`sep${i}`} aria-hidden="true" />, el] : [el]));

/* ---------------------------------------------------------------- Top bar */

function WeatherChip() {
  const { config } = useCfg();
  const { num } = useI18n();
  const { data } = useWeather(config.show.weather);
  const cur = data?.current;
  const info = cur ? wxInfo(cur.weather_code, cur.is_day) : null;
  return (
    <>
      {info ? <info.Icon size={18} className={`tone-${info.tone}`} /> : <CloudSun size={18} />}
      <span className="lbl">{config.city.name}</span>
      {cur && <b className="temp">{num(Math.round(cur.temperature_2m))}<sup dir="ltr">°{config.unit === 'fahrenheit' ? 'F' : 'C'}</sup></b>}
    </>
  );
}

function Ticker({ markets }) {
  const { config } = useCfg();
  const coin = markets.data?.find(x => x.id === config.ticker) || markets.data?.[0];
  if (!coin) {
    const sym = COINS.find(c => c.id === config.ticker)?.sym || 'BTC';
    return <span className="ticker" dir="ltr"><span className="coin-ph" /><b>{sym}</b><span className="muted">···</span></span>;
  }
  return (
    <span className="ticker" dir="ltr">
      <img src={coin.image} width="18" height="18" alt="" />
      <b>{coin.sym}</b>
      <span>{usd(coin.price)}</span>
      <span className={`chg ${coin.change >= 0 ? 'up' : 'down'}`}>{pct(coin.change)}</span>
    </span>
  );
}

function MiniRing({ progress }) {
  const r = 7, c = 2 * Math.PI * r;
  return (
    <svg className="mini-ring" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r={r} className="track" />
      <circle cx="9" cy="9" r={r} className="bar" strokeDasharray={c} strokeDashoffset={c * (1 - progress)} />
    </svg>
  );
}

function FocusPill() {
  const { config } = useCfg();
  const { t } = useI18n();
  const now = useNow(1000);
  const st = focusState(config.focus, now.getTime());
  const total = config.focus.minutes * 60_000;
  const label = st.mode === 'idle'
    ? <><LocateFixed size={16} /><span>{t('focus')}</span></>
    : <><MiniRing progress={1 - st.left / total} /><span className="mono" dir="ltr">{mmss(st.left)}</span>{st.mode === 'paused' && <Pause size={12} />}</>;
  return (
    <Pop id="focus" align="center" width={320} title={t('focus')} btnClass={`pill ${st.mode !== 'idle' ? 'active' : ''}`} ariaLabel={st.mode === 'idle' ? t('focus') : `${t('focusRunning')} ${mmss(st.left)}`} label={label}>
      <FocusPanel />
    </Pop>
  );
}

function TopBar({ markets, openTool }) {
  const { config } = useCfg();
  const { t } = useI18n();
  const s = config.show;
  return (
    <header className="bar bar-top">
      <div className="bar-group dim">
        {withSeparators([
          <Pop key="apps" id="apps" width={372} title={t('tools')} ariaLabel={t('tools')} btnClass="icon-only" label={<Grip size={21} />}><ToolsLauncher onOpen={openTool} /></Pop>,
          s.news && <Pop key="news" id="news" width={390} title={t('news')} label={<><Newspaper size={17} /><span className="lbl">{t('news')}</span></>}><NewsPanel /></Pop>,
          s.weather && <Pop key="weather" id="weather" width={350} title={t('weather')} ariaLabel={t('weather')} label={<WeatherChip />}><WeatherPanel /></Pop>,
        ])}
      </div>
      <div className="bar-center">{s.focus && <FocusPill />}</div>
      <div className="bar-group bar-end dim">
        {withSeparators([
          s.ticker && <Pop key="ticker" id="ticker" align="end" width={370} title={t('markets')} ariaLabel={t('markets')} label={<Ticker markets={markets} />}><MarketsPanel /></Pop>,
          s.alerts && <Pop key="alerts" id="alerts" align="end" width={370} title={t('priceAlert')} label={<><Bell size={16} /><span className="lbl">{t('priceAlert')}</span></>}><AlertsPanel /></Pop>,
          s.converter && <Pop key="converter" id="converter" align="end" width={340} title={t('converter')} label={<><ArrowLeftRight size={16} /><span className="lbl">{t('converter')}</span></>}><ConverterPanel /></Pop>,
        ])}
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- Centre: clock, date, search */

function SearchRow() {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [failed, setFailed] = useState(false);
  const submit = async e => {
    e.preventDefault();
    setFailed(false);
    try { await submitSearch(q); } catch { setFailed(true); }
  };
  return (
    <div className="search-row">
      <form className="search" onSubmit={submit} role="search">
        <button type="submit" className="bar-btn engine-btn" aria-label={t('searchButton')}><Search size={22} aria-hidden="true" /></button>
        <input value={q} onChange={e => { setQ(e.target.value); setFailed(false); }} placeholder={t('searchPlaceholder')} aria-label={t('searchPlaceholder')} autoFocus autoComplete="off" spellCheck="false" />
        {failed && <span className="search-error" role="status">{t('searchUnavailable')}</span>}
      </form>
      <Pop id="shortcuts" align="end" width={372} title={t('shortcuts')} ariaLabel={t('shortcuts')} btnClass="square" label={<Bookmark size={20} />}><ShortcutsPanel /></Pop>
    </div>
  );
}

function Stage() {
  const { config, update } = useCfg();
  const { t, lang } = useI18n();
  const now = useNow(1000);
  const active = Math.min(config.activeClock ?? 0, config.clocks.length - 1);
  const tz = config.clocks[active];
  return (
    <main className="stage">
      <div className="clock">
        <span className="time" dir="ltr">{clockTime(now, tz)}</span>
        <div className="clock-cities" role="radiogroup" aria-label={t('clockCities')}>
          {config.clocks.map((c, i) => (
            <button key={`${c}${i}`} role="radio" aria-checked={i === active} className={i === active ? 'on' : ''} onClick={() => update({ activeClock: i })} title={`${cityName(c, lang)} ${clockTime(now, c)}`}>
              {cityName(c, lang)}
            </button>
          ))}
        </div>
      </div>
      <Pop id="calendar" align="center" width={560} title={t('calendar')} btnClass="date-btn" label={<><span>{fullDate(now, lang)}</span><ChevronDown size={16} /></>}>
        <CalendarPanel />
      </Pop>
      <SearchRow />
    </main>
  );
}

/* ---------------------------------------------------------------- Bottom bar */

function IpChip({ ip }) {
  const online = useOnline();
  const { t } = useI18n();
  const d = ip.data;
  return (
    <>
      <span className="flag" aria-hidden="true">{d ? flagEmoji(d.country) : '🌐'}</span>
      <span className="ip-num" dir="ltr">{d ? d.ip : '···'}</span>
      <span className={`ip-state ${online ? 'on' : 'off'}`}>{online ? t('online') : t('offline')}</span>
    </>
  );
}

function BottomBar({ ip }) {
  const { config, update } = useCfg();
  const { t, dir, num } = useI18n();
  const s = config.show;
  const pending = config.tasks.filter(x => !x.done).length;
  const Prev = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const Next = dir === 'rtl' ? ChevronLeft : ChevronRight;
  return (
    <footer className="bar bar-bottom">
      <div className="bar-group dim">
        {s.tasks && (
          <Pop id="tasks" up width={370} title={t('myTasks')} ariaLabel={pending ? `${t('myTasks')} (${num(pending)})` : t('myTasks')}
            label={<><ClipboardList size={18} /><span className="lbl">{t('myTasks')}</span>{pending > 0 && <span className="badge-dot" />}</>}>
            <TasksPanel />
          </Pop>
        )}
        {s.notes && <Pop id="notes" up width={370} title={t('notes')} label={<><NotebookPen size={18} /><span className="lbl">{t('notes')}</span></>}><NotesPanel /></Pop>}
      </div>
      <div className="bar-center dim">
        {s.wallpaperControls && (
          <div className="wp-controls">
            <button type="button" onClick={() => update(c => ({ wallpaper: stepWallpaper(c.wallpaper, -1) }))} aria-label={t('prevWallpaper')} title={t('prevWallpaper')}><Prev size={19} /></button>
            <button type="button" onClick={() => update(c => ({ slideshow: !c.slideshow }))} aria-pressed={config.slideshow} aria-label={config.slideshow ? t('pauseWallpapers') : t('playWallpapers')} title={config.slideshow ? t('pauseWallpapers') : t('playWallpapers')}>
              {config.slideshow ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
            </button>
            <button type="button" onClick={() => update(c => ({ wallpaper: stepWallpaper(c.wallpaper, 1) }))} aria-label={t('nextWallpaper')} title={t('nextWallpaper')}><Next size={19} /></button>
          </div>
        )}
      </div>
      <div className="bar-group bar-end dim">
        {s.ip && (
          <>
            <span className="ip-label">{t('yourIp')}</span>
            <Pop id="ip" up align="end" width={310} title={t('yourIp')} ariaLabel={t('yourIp')} btnClass="ip-pill" label={<IpChip ip={ip} />}><IpPanel ip={ip} /></Pop>
          </>
        )}
        <Pop id="settings" up align="end" width={390} title={t('settings')} ariaLabel={t('settings')} btnClass="icon-only" label={<Settings size={20} />}><SettingsPanel /></Pop>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- Shell */

function Wallpaper({ id }) {
  const wp = wallpaperById(id);
  return (
    <div className="wp" style={{ backgroundColor: wp.base }} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.div key={wp.id} className={`wp-layer ${wp.photo ? 'is-photo' : ''}`} style={{ backgroundImage: `url(${wp.url})` }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: 'easeInOut' }} />
      </AnimatePresence>
      <div className="wp-shade" />
    </div>
  );
}

function ToolModal({ tool, close }) {
  const { t } = useI18n();
  const item = TOOLS.find(x => x.key === tool);
  return (
    <AnimatePresence>
      {item && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
          <motion.section className="modal" role="dialog" aria-modal="true" aria-label={t(item.label)}
            initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }} transition={{ duration: .18 }}>
            <header className="modal-head"><span><item.Icon size={18} />{t(item.label)}</span><button className="icon-btn" onClick={close} aria-label={t('close')}><X size={18} /></button></header>
            <div className="modal-body"><item.Panel /></div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [660, 880].forEach((freq, i) => {
      const at = ctx.currentTime + i * .18;
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(.0001, at);
      gain.gain.exponentialRampToValueAtTime(.18, at + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, at + .5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at); osc.stop(at + .55);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch { /* audio unavailable */ }
}

function NewTab() {
  const [config, update] = useConfig();
  const i18n = useMemo(() => makeI18n(config.lang), [config.lang]);
  const { t } = i18n;
  const [open, setOpen] = useState(null);
  const [tool, setTool] = useState(null);
  const [toasts, setToasts] = useState([]);
  const markets = useMarkets(config.show.ticker || config.alerts.some(a => !a.hit));
  const ip = useRemote(sources.ip, { poll: 120_000, enabled: config.show.ip });

  const toast = useCallback((text, kind = 'info') => {
    const id = `${Date.now()}${Math.random()}`;
    setToasts(ts => [...ts.slice(-2), { id, text, kind }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 6000);
  }, []);

  useEffect(() => {
    document.documentElement.lang = config.lang;
    document.documentElement.dir = i18n.dir;
    document.title = config.lang === 'fa' ? 'تب جدید · SBC Start' : 'New Tab · SBC Start';
  }, [config.lang, i18n.dir]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { if (tool) setTool(null); else setOpen(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tool]);

  // A connection change usually means a VPN or network switch, so re-check the public IP.
  const refreshIp = ip.refresh;
  useEffect(() => {
    const onOnline = () => refreshIp(true);
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [refreshIp]);

  // Finish the focus session when its end time passes (in whichever tab is open).
  const endAt = config.focus.endAt;
  useEffect(() => {
    if (!endAt) return undefined;
    const id = setTimeout(() => {
      update(c => (c.focus.endAt === endAt ? { focus: { ...c.focus, endAt: null, remaining: null } } : {}));
      if (document.visibilityState === 'visible') { toast(t('focusDone')); chime(); }
    }, Math.max(0, endAt - Date.now()));
    return () => clearTimeout(id);
  }, [endAt, update, toast, t]);

  // Price alerts: compare every fresh market snapshot with the user's thresholds.
  useEffect(() => {
    if (!markets.data) return;
    const price = id => markets.data.find(c => c.id === id)?.price;
    const hits = config.alerts.filter(a => {
      const p = price(a.coin);
      return !a.hit && p != null && (a.dir === 'above' ? p >= a.price : p <= a.price);
    });
    if (!hits.length) return;
    update(c => ({ alerts: c.alerts.map(a => (hits.some(h => h.id === a.id) ? { ...a, hit: true } : a)) }));
    if (document.visibilityState === 'visible') {
      hits.forEach(h => toast(t('alertToast', { coin: coinSym(h.coin, markets.data), price: usd(h.price) }), 'alert'));
      chime();
    }
  }, [markets.data, config.alerts, update, toast, t]);

  // Wallpaper slideshow (only the visible tab advances it).
  useEffect(() => {
    if (!config.slideshow) return undefined;
    const id = setInterval(() => { if (document.visibilityState === 'visible') update(c => ({ wallpaper: stepWallpaper(c.wallpaper, 1) })); }, 20_000);
    return () => clearInterval(id);
  }, [config.slideshow, update]);

  const openTool = key => { setOpen(null); setTool(key); };
  const cfg = useMemo(() => ({ config, update }), [config, update]);
  const pop = useMemo(() => ({ open, setOpen }), [open]);
  const focusing = !!config.focus.endAt;

  return (
    <AnimateUIProvider>
      <ConfigContext.Provider value={cfg}>
        <I18nContext.Provider value={i18n}>
          <PopContext.Provider value={pop}>
            <div className={`nt ${focusing ? 'is-focusing' : ''}`} dir={i18n.dir} lang={config.lang}>
              <Wallpaper id={config.wallpaper} />
              <TopBar markets={markets} openTool={openTool} />
              <Stage />
              <BottomBar ip={ip} />
              <ToolModal tool={tool} close={() => setTool(null)} />
              <div className="toasts" aria-live="polite">
                <AnimatePresence>
                  {toasts.map(x => (
                    <motion.div key={x.id} className={`toast ${x.kind}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                      {x.kind === 'alert' ? <BellRing size={16} /> : <LocateFixed size={16} />}{x.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </PopContext.Provider>
        </I18nContext.Provider>
      </ConfigContext.Provider>
    </AnimateUIProvider>
  );
}

createRoot(document.getElementById('root')).render(<NewTab />);
