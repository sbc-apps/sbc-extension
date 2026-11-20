// Calendar helpers built only on Intl, so Solar Hijri (Jalali), Gregorian and Hijri dates
// need no extra library.
const persianNumeric = new Intl.DateTimeFormat('en-US-u-ca-persian', { day: 'numeric', month: 'numeric', year: 'numeric' });

export function persianParts(date) {
  const out = {};
  for (const p of persianNumeric.formatToParts(date)) {
    if (p.type === 'year' || p.type === 'month' || p.type === 'day') out[p.type] = parseInt(p.value, 10);
  }
  return out;
}

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function clockTime(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  }
}

// "جمعه ۲۹ آبان ۱۴۰۵" in Persian, "Friday, November 20, 2026" in English.
export function fullDate(date, lang) {
  if (lang === 'fa') {
    const p = Object.fromEntries(new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .formatToParts(date).map(x => [x.type, x.value]));
    return `${p.weekday} ${p.day} ${p.month} ${p.year}`;
  }
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

export function altDates(date, lang) {
  const loc = lang === 'fa' ? 'fa-IR' : 'en-US';
  const opts = { day: 'numeric', month: 'long', year: 'numeric' };
  const persian = Object.fromEntries(new Intl.DateTimeFormat(`${loc}-u-ca-persian`, opts).formatToParts(date).map(x => [x.type, x.value]));
  return {
    jalali: lang === 'fa' ? `${persian.day} ${persian.month} ${persian.year}` : new Intl.DateTimeFormat(`${loc}-u-ca-persian`, opts).format(date),
    gregorian: new Intl.DateTimeFormat(loc, { ...opts, calendar: 'gregory' }).format(date),
    hijri: new Intl.DateTimeFormat(`${loc}-u-ca-islamic-umalqura`, opts).format(date),
  };
}

// Month grid for either calendar. `offset` is months away from the current month.
export function monthGrid(calendar, offset, lang, today = new Date()) {
  const loc = lang === 'fa' ? 'fa-IR' : 'en-US';
  const base = startOfDay(today);
  let first, length;
  if (calendar === 'persian') {
    first = addDays(base, -(persianParts(base).day - 1));
    for (let i = 0; i < offset; i++) { const next = addDays(first, 32); first = addDays(next, -(persianParts(next).day - 1)); }
    for (let i = 0; i > offset; i--) { const prev = addDays(first, -1); first = addDays(prev, -(persianParts(prev).day - 1)); }
    const month = persianParts(first).month;
    length = 0;
    while (length < 32 && persianParts(addDays(first, length)).month === month) length++;
  } else {
    first = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    length = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  }
  const weekStart = lang === 'fa' ? 6 : 0; // Saturday in Iran, Sunday otherwise
  const lead = (first.getDay() - weekStart + 7) % 7;
  const calId = calendar === 'persian' ? 'persian' : 'gregory';
  const title = new Intl.DateTimeFormat(loc, { calendar: calId, month: 'long', year: 'numeric' }).format(first);
  const dayFmt = new Intl.DateTimeFormat(loc, { calendar: calId, day: 'numeric' });
  const weekdayFmt = new Intl.DateTimeFormat(loc, { weekday: 'narrow' });
  const ref = addDays(first, -first.getDay()); // a Sunday
  const weekdays = Array.from({ length: 7 }, (_, i) => weekdayFmt.format(addDays(ref, (weekStart + i) % 7)));
  const days = Array.from({ length }, (_, i) => {
    const d = addDays(first, i);
    return { date: d, label: dayFmt.format(d), today: sameDay(d, base), weekend: d.getDay() === (lang === 'fa' ? 5 : 0) || (lang !== 'fa' && d.getDay() === 6) };
  });
  return { title, lead, weekdays, days };
}

export function relativeTime(date, lang) {
  const diff = (new Date(date).getTime() - Date.now()) / 1000;
  if (!Number.isFinite(diff)) return '';
  const rtf = new Intl.RelativeTimeFormat(lang === 'fa' ? 'fa' : 'en', { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  return rtf.format(Math.round(diff / 86400), 'day');
}

// Minutes between a time zone and the browser's local zone, e.g. +30 or -210.
export function tzOffsetMinutes(timeZone, date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
  }).formatToParts(date).map(p => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  const zoneOffset = Math.round((asUtc - date.getTime()) / 60000);
  return zoneOffset + date.getTimezoneOffset();
}
