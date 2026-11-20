import { createContext, useContext } from 'react';

// UI strings. Persian (fa) is the default and is right-to-left; English (en) is left-to-right.
const fa = {
  news: 'اخبار', weather: 'آب و هوا', focus: 'تمرکز', priceAlert: 'هشدار قیمت', converter: 'مبدل قیمت',
  markets: 'لیست قیمت', myTasks: 'کارهای من', notes: 'یادداشت‌ها', yourIp: 'آی‌پی شما', online: 'متصل', offline: 'آفلاین',
  settings: 'تنظیمات', tools: 'ابزارها', calendar: 'تقویم', worldClock: 'ساعت جهانی', shortcuts: 'میان‌برها',
  searchPlaceholder: 'جستجو در {engine} یا وارد کردن آدرس', searchEngine: 'موتور جستجو',
  prevWallpaper: 'پس‌زمینه‌ی قبلی', nextWallpaper: 'پس‌زمینه‌ی بعدی', playWallpapers: 'نمایش خودکار پس‌زمینه‌ها', pauseWallpapers: 'توقف نمایش خودکار',
  close: 'بستن', loading: 'در حال دریافت…', retry: 'تلاش دوباره', add: 'افزودن', remove: 'حذف', save: 'ذخیره', cancel: 'انصراف',
  humidity: 'رطوبت', wind: 'باد', feelsLike: 'دمای محسوس', changeCity: 'تغییر شهر', searchCity: 'نام شهر را بنویسید…', noCity: 'شهری پیدا نشد.',
  weatherError: 'اطلاعات آب و هوا الان در دسترس نیست.', kmh: 'km/h', weatherSource: 'منبع: Open-Meteo',
  wx: { clear: 'صاف', mostlyClear: 'کمی ابری', cloudy: 'ابری', fog: 'مه‌آلود', drizzle: 'نم‌نم باران', rain: 'بارانی', snow: 'برفی', storm: 'رعد و برق' },
  newsError: 'دریافت اخبار ممکن نشد. خبرها را مستقیم در سایت SBC بخوانید:', newsSource: 'اخبار SBC', openSite: 'همه‌ی اخبار',
  marketsError: 'قیمت‌ها الان در دسترس نیست.', pinHint: 'روی هر ارز بزنید تا در نوار بالا نمایش داده شود.', marketsSource: 'منبع: CoinGecko · فقط جهت اطلاع',
  alertsHint: 'هشدارها تا وقتی یک تب SBC Start باز است، هر دقیقه بررسی می‌شوند.', above: 'بالاتر از', below: 'پایین‌تر از',
  noAlerts: 'هنوز هشداری نساخته‌اید.', triggered: 'فعال شد', pricePlaceholder: 'قیمت به دلار', alertToast: '{coin} به {price} رسید',
  amount: 'مقدار', swap: 'جابجایی', converterSource: 'نرخ‌ها تقریبی است و مبنای معامله نیست.',
  focusIdle: 'مدت را انتخاب کنید و شروع کنید.', start: 'شروع', pause: 'توقف', resume: 'ادامه', reset: 'از نو', minutes: 'دقیقه',
  focusDone: 'زمان تمرکز تمام شد. کمی استراحت کنید!', focusHint: 'تا پایان زمان، بقیه‌ی ابزارها کم‌رنگ می‌شوند.', focusRunning: 'در حال تمرکز',
  addTask: 'کار جدید…', noTasks: 'کاری در فهرست نیست.', clearDone: 'حذف انجام‌شده‌ها', tasksLeft: '{n} کار باقی مانده',
  priority: { high: 'اولویت بالا', mid: 'اولویت متوسط', low: 'اولویت پایین' },
  notesPlaceholder: 'هر چیزی که می‌خواهید یادداشت کنید…', notesSaved: 'به‌طور خودکار ذخیره می‌شود',
  today: 'امروز', jalali: 'شمسی', gregorian: 'میلادی', hijri: 'قمری',
  addCity: 'افزودن شهر…', localTime: 'ساعت محلی',
  addShortcut: 'افزودن میان‌بر', shortcutTitle: 'عنوان', shortcutUrl: 'آدرس سایت', noShortcuts: 'هنوز میان‌بری ندارید.',
  copyIp: 'کپی آی‌پی', copied: 'کپی شد', refresh: 'بروزرسانی', country: 'کشور', ipError: 'آی‌پی در دسترس نیست', ipSource: 'منبع: country.is',
  language: 'زبان', clockCities: 'شهرهای ساعت اصلی', tempUnit: 'واحد دما', celsius: 'سلسیوس', fahrenheit: 'فارنهایت',
  wallpaper: 'پس‌زمینه', widgets: 'نمایش ابزارها', resetAll: 'بازنشانی همه‌ی داده‌ها', resetConfirm: 'همه‌ی کارها، یادداشت‌ها و تنظیمات پاک شوند؟',
  privacyNote: 'همه‌ی داده‌ها فقط در همین مرورگر ذخیره می‌شوند.', version: 'نسخه', website: 'وب‌سایت SBC',
  wallpapers: { aurora: 'شفق', ocean: 'اقیانوس', emerald: 'زمرد', ember: 'اخگر', meadow: 'دشت' },
  widgetNames: { ticker: 'قیمت لحظه‌ای', alerts: 'هشدار قیمت', converter: 'مبدل قیمت', news: 'اخبار', weather: 'آب و هوا', focus: 'تمرکز', tasks: 'کارهای من', notes: 'یادداشت‌ها', ip: 'آی‌پی', wallpaperControls: 'کنترل پس‌زمینه' },
  engines: { google: 'گوگل', duckduckgo: 'داک‌داک‌گو', bing: 'بینگ' },
};

const en = {
  news: 'News', weather: 'Weather', focus: 'Focus', priceAlert: 'Price alert', converter: 'Converter',
  markets: 'Markets', myTasks: 'My tasks', notes: 'Notes', yourIp: 'Your IP', online: 'Online', offline: 'Offline',
  settings: 'Settings', tools: 'Tools', calendar: 'Calendar', worldClock: 'World clock', shortcuts: 'Shortcuts',
  searchPlaceholder: 'Search {engine} or type a URL', searchEngine: 'Search engine',
  prevWallpaper: 'Previous wallpaper', nextWallpaper: 'Next wallpaper', playWallpapers: 'Play wallpaper slideshow', pauseWallpapers: 'Pause slideshow',
  close: 'Close', loading: 'Loading…', retry: 'Try again', add: 'Add', remove: 'Remove', save: 'Save', cancel: 'Cancel',
  humidity: 'Humidity', wind: 'Wind', feelsLike: 'Feels like', changeCity: 'Change city', searchCity: 'Search a city…', noCity: 'No matching city.',
  weatherError: 'Weather is unavailable right now.', kmh: 'km/h', weatherSource: 'Source: Open-Meteo',
  wx: { clear: 'Clear', mostlyClear: 'Mostly clear', cloudy: 'Cloudy', fog: 'Fog', drizzle: 'Drizzle', rain: 'Rain', snow: 'Snow', storm: 'Thunderstorm' },
  newsError: 'News could not be loaded. Read it on the SBC website:', newsSource: 'SBC News', openSite: 'All news',
  marketsError: 'Prices are unavailable right now.', pinHint: 'Click a coin to show it in the top bar.', marketsSource: 'Source: CoinGecko · informational only',
  alertsHint: 'Alerts are checked every minute while an SBC Start tab is open.', above: 'Above', below: 'Below',
  noAlerts: 'No alerts yet.', triggered: 'Triggered', pricePlaceholder: 'Price in USD', alertToast: '{coin} reached {price}',
  amount: 'Amount', swap: 'Swap', converterSource: 'Indicative rates — not for trading.',
  focusIdle: 'Pick a length and start.', start: 'Start', pause: 'Pause', resume: 'Resume', reset: 'Reset', minutes: 'min',
  focusDone: 'Focus session complete — take a short break!', focusHint: 'Other widgets fade out until the session ends.', focusRunning: 'Focusing',
  addTask: 'New task…', noTasks: 'Nothing on your list.', clearDone: 'Clear completed', tasksLeft: '{n} left',
  priority: { high: 'High priority', mid: 'Medium priority', low: 'Low priority' },
  notesPlaceholder: 'Jot something down…', notesSaved: 'Saved automatically',
  today: 'Today', jalali: 'Solar Hijri', gregorian: 'Gregorian', hijri: 'Hijri',
  addCity: 'Add a city…', localTime: 'Local time',
  addShortcut: 'Add shortcut', shortcutTitle: 'Title', shortcutUrl: 'Website address', noShortcuts: 'No shortcuts yet.',
  copyIp: 'Copy IP', copied: 'Copied', refresh: 'Refresh', country: 'Country', ipError: 'IP unavailable', ipSource: 'Source: country.is',
  language: 'Language', clockCities: 'Main clock cities', tempUnit: 'Temperature unit', celsius: 'Celsius', fahrenheit: 'Fahrenheit',
  wallpaper: 'Wallpaper', widgets: 'Visible widgets', resetAll: 'Reset all data', resetConfirm: 'Erase all tasks, notes and settings?',
  privacyNote: 'Everything is stored only in this browser.', version: 'Version', website: 'SBC website',
  wallpapers: { aurora: 'Aurora', ocean: 'Ocean', emerald: 'Emerald', ember: 'Ember', meadow: 'Meadow' },
  widgetNames: { ticker: 'Price ticker', alerts: 'Price alerts', converter: 'Converter', news: 'News', weather: 'Weather', focus: 'Focus', tasks: 'My tasks', notes: 'Notes', ip: 'IP address', wallpaperControls: 'Wallpaper controls' },
  engines: { google: 'Google', duckduckgo: 'DuckDuckGo', bing: 'Bing' },
};

export const STRINGS = { fa, en };

// Time zones offered for clocks, with localized city names.
export const CITIES = [
  ['Asia/Tehran', 'تهران', 'Tehran'], ['Asia/Muscat', 'مسقط', 'Muscat'], ['Asia/Dubai', 'دبی', 'Dubai'],
  ['Asia/Riyadh', 'ریاض', 'Riyadh'], ['Asia/Baghdad', 'بغداد', 'Baghdad'], ['Asia/Kabul', 'کابل', 'Kabul'],
  ['Europe/Istanbul', 'استانبول', 'Istanbul'], ['Europe/London', 'لندن', 'London'], ['Europe/Paris', 'پاریس', 'Paris'],
  ['Europe/Berlin', 'برلین', 'Berlin'], ['America/New_York', 'نیویورک', 'New York'], ['America/Toronto', 'تورنتو', 'Toronto'],
  ['America/Los_Angeles', 'لس‌آنجلس', 'Los Angeles'], ['Asia/Kolkata', 'دهلی نو', 'New Delhi'], ['Asia/Singapore', 'سنگاپور', 'Singapore'],
  ['Asia/Shanghai', 'شانگهای', 'Shanghai'], ['Asia/Tokyo', 'توکیو', 'Tokyo'], ['Australia/Sydney', 'سیدنی', 'Sydney'],
];

export function cityName(tz, lang) {
  const row = CITIES.find(c => c[0] === tz);
  if (row) return lang === 'fa' ? row[1] : row[2];
  return tz.split('/').pop().replace(/_/g, ' ');
}

export function makeI18n(lang) {
  const dict = STRINGS[lang] || fa;
  const t = (key, vars) => {
    let s = key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
    if (s == null) s = key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
    return s;
  };
  const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
  return {
    lang, t, locale, dir: lang === 'fa' ? 'rtl' : 'ltr',
    num: (v, opts) => new Intl.NumberFormat(locale, opts).format(v),
  };
}

export const I18nContext = createContext(makeI18n('fa'));
export const useI18n = () => useContext(I18nContext);
