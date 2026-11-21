import { useCallback, useEffect, useState } from 'react';

// Everything the new tab remembers lives in one localStorage record for the extension origin.
const KEY = 'sbc-start-settings-v2';
const LEGACY_KEY = 'sbc-start-settings-v1';

export const searchEngines = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  bing: 'https://www.bing.com/search?q=',
};

export const WIDGETS = ['ticker', 'alerts', 'converter', 'news', 'weather', 'focus', 'tasks', 'notes', 'ip', 'wallpaperControls'];

// The main clock starts on the browser's own time zone, paired with Tehran (or Muscat for Tehran users).
function defaultClocks() {
  let local = 'Asia/Muscat';
  try { local = Intl.DateTimeFormat().resolvedOptions().timeZone || local; } catch { /* keep Muscat */ }
  return [local, local === 'Asia/Tehran' ? 'Asia/Muscat' : 'Asia/Tehran'];
}

export const defaults = {
  lang: 'en',
  search: 'google',
  unit: 'celsius',
  city: { name: 'Muscat', lat: 23.588, lon: 58.383 },
  clocks: defaultClocks(),
  activeClock: 0, // index into clocks shown as the big clock
  worldClocks: ['Asia/Tehran', 'Asia/Muscat', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'Asia/Tokyo'],
  ticker: 'bitcoin',
  alerts: [], // { id, coin, dir: 'above' | 'below', price, hit: false }
  tasks: [], // { id, text, done, priority: 'high' | 'mid' | 'low' }
  notes: '',
  links: [
    { id: 'sbc', title: 'SBC', url: 'https://sbc.om' },
    { id: 'github', title: 'GitHub', url: 'https://github.com' },
    { id: 'gmail', title: 'Gmail', url: 'https://mail.google.com' },
    { id: 'youtube', title: 'YouTube', url: 'https://www.youtube.com' },
  ],
  wallpaper: 'aurora',
  slideshow: false,
  focus: { minutes: 25, endAt: null, remaining: null },
  show: Object.fromEntries(WIDGETS.map(w => [w, true])),
};

function migrateLegacy(old) {
  const out = {};
  if (old.search) out.search = old.search;
  if (old.unit) out.unit = old.unit;
  if (typeof old.lat === 'number' && typeof old.lon === 'number') out.city = { name: old.city || 'Muscat', lat: old.lat, lon: old.lon };
  if (Array.isArray(old.tasks)) out.tasks = old.tasks.map(t => ({ id: t.id, text: t.text, done: !!t.done, priority: 'mid' }));
  if (Array.isArray(old.links)) out.links = old.links.map(l => ({ id: l.id, title: l.label || l.title, url: l.url }));
  return out;
}

export function load() {
  try {
    let saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!saved) {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
      saved = legacy ? migrateLegacy(legacy) : {};
    }
    return {
      ...defaults,
      ...saved,
      city: { ...defaults.city, ...(saved.city || {}) },
      focus: { ...defaults.focus, ...(saved.focus || {}) },
      show: { ...defaults.show, ...(saved.show || {}) },
      clocks: Array.isArray(saved.clocks) && saved.clocks.length === 2 ? saved.clocks : defaults.clocks,
      worldClocks: Array.isArray(saved.worldClocks) ? saved.worldClocks : defaults.worldClocks,
      alerts: Array.isArray(saved.alerts) ? saved.alerts : [],
      tasks: Array.isArray(saved.tasks) ? saved.tasks : [],
      links: Array.isArray(saved.links) ? saved.links : defaults.links,
    };
  } catch {
    return { ...defaults };
  }
}

export function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage full or blocked */ }
}

export function resetAll() {
  try { localStorage.removeItem(KEY); localStorage.removeItem(LEGACY_KEY); } catch { /* ignore */ }
}

// Settings hook shared by every widget. Changes made in one tab show up in all open tabs.
export function useConfig() {
  const [config, setConfig] = useState(load);
  useEffect(() => save(config), [config]);
  useEffect(() => {
    const onStorage = e => { if (e.key === KEY) setConfig(load()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const update = useCallback(patch => setConfig(c => ({ ...c, ...(typeof patch === 'function' ? patch(c) : patch) })), []);
  return [config, update, setConfig];
}

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
