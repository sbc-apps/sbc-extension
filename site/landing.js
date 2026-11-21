// SBC Start landing page behaviour. Plain ES module, no build step (served as-is by GitHub Pages).
import { BRAND } from '../src/brand-icons.js';

export const VERSION = '1.5.1'; // keep in sync with package.json / manifest.json (checked in CI)
const REPO = 'https://github.com/sbc-apps/sbc-extension';
const ZIP = {
  chromium: `${REPO}/releases/latest/download/sbc-start-chromium.zip`,
  firefox: `${REPO}/releases/latest/download/sbc-start-firefox.zip`,
};
const LANG_KEY = 'sbc-start-landing-lang';

const BROWSERS = {
  chrome: { glyph: 'chrome', url: 'chrome://extensions', fa: 'کروم', en: 'Chrome' },
  brave: { glyph: 'brave', url: 'brave://extensions', fa: 'بریو', en: 'Brave' },
  edge: { glyph: 'edge', url: 'edge://extensions', fa: 'اج', en: 'Edge' },
  firefox: { glyph: 'firefox', url: 'about:debugging#/runtime/this-firefox', fa: 'فایرفاکس', en: 'Firefox', firefox: true },
  opera: { glyph: 'opera', url: 'opera://extensions', fa: 'اپرا', en: 'Opera' },
  vivaldi: { glyph: 'vivaldi', url: 'vivaldi://extensions', fa: 'ویوالدی', en: 'Vivaldi' },
  chromium: { glyph: 'chrome', url: 'chrome://extensions', fa: 'مرورگرهای کرومیوم', en: 'Chromium browsers' },
};

const T = {
  fa: {
    pageTitle: 'افزونه SBC Start: همه‌چیز در یک تب جدید',
    title: 'افزونه SBC Start',
    words: ['قیمت ارزها', 'اخبار روز', 'کارهای خود', 'آب و هوا', 'تقویم شمسی'],
    wordsSr: 'قیمت ارزها، اخبار روز، کارهای خود و آب و هوا',
    statementTail: 'را در افزونه SBC دنبال کن',
    downloadGroup: 'دانلود برای مرورگر', otherBrowsers: 'مرورگرهای دیگر', otherChromium: 'سایر مرورگرهای کرومیوم',
    version: 'نسخه', toolsCount: '+۱۲', tools: 'ابزار کاربردی', free: 'رایگان', noSignup: 'بدون ثبت‌نام',
    f: { weather: 'آب و هوا', news: 'اخبار روز', calendar: 'تقویم', tasks: 'کارهای من', prices: 'لیست قیمت', timer: 'تایمر', clock: 'ساعت', converter: 'مبدل قیمت' },
    company: 'SBC · Senior Block Chain',
    about: 'درباره ما', contact: 'تماس با ما', privacy: 'حریم خصوصی', github: 'گیت‌هاب', close: 'بستن',
    downloadZip: 'دانلود فایل افزونه', allReleases: 'همه‌ی نسخه‌ها', toggle: 'English', privacyFull: 'متن کامل سیاست حریم خصوصی',
    features: {
      weather: ['آب و هوا', 'دمای لحظه‌ای، رطوبت، باد و پیش‌بینی پنج روز آینده‌ی شهرت را در یک نگاه ببین. شهرت را هم خودت انتخاب کن.'],
      news: ['اخبار روز', 'تازه‌ترین اخبار، محصولات و پروژه‌های SBC همیشه یک کلیک با تو فاصله دارند؛ بدون باز کردن ده‌ها تب.'],
      calendar: ['تقویم', 'تاریخ شمسی، میلادی و قمری کنار هم، همراه با تقویم ماهانه برای برنامه‌ریزی روزهایت.'],
      tasks: ['کارهای من', 'لحظه‌هایت را با کارهای من مدیریت کن. یک فهرست ساده با اولویت‌بندی که کمک می‌کند هیچ کاری از قلم نیفتد.'],
      prices: ['لیست قیمت', 'قیمت لحظه‌ای بیت‌کوین و ارزهای محبوب با تغییرات ۲۴ ساعته. ارز دلخواهت را در نوار بالا سنجاق کن.'],
      timer: ['تایمر تمرکز', 'با تایمر پومودورو روی کار مهم بمان. تا وقتی تایمر روشن است، بقیه‌ی ابزارها کنار می‌روند.'],
      clock: ['ساعت جهانی', 'ساعت شهرهای مختلف دنیا را کنار هم ببین و جلسه‌هایت را راحت‌تر هماهنگ کن.'],
      converter: ['مبدل قیمت', 'ارزهای دیجیتال و ارزهای رایج مثل دلار، یورو و ریال عمان را با نرخ لحظه‌ای به هم تبدیل کن.'],
    },
    installTitle: 'نصب روی {b}',
    installLead: 'SBC Start هنوز در فروشگاه افزونه‌ها منتشر نشده است. با این چهار قدم آن را مستقیم از گیت‌هاب نصب کنید.',
    stepsChromium: [
      'فایل ZIP افزونه را دانلود و در یک پوشه از حالت فشرده خارج کنید.',
      'آدرس <code>{url}</code> را در نوار آدرس باز کنید و «Developer mode» را روشن کنید.',
      'روی «Load unpacked» بزنید و پوشه‌ی استخراج‌شده را انتخاب کنید.',
      'یک تب جدید باز کنید. اگر مرورگر پرسید، گزینه‌ی «Keep it» را انتخاب کنید.',
    ],
    stepsFirefox: [
      'فایل ZIP مخصوص فایرفاکس را دانلود و از حالت فشرده خارج کنید.',
      'آدرس <code>{url}</code> را در نوار آدرس باز کنید.',
      'روی «Load Temporary Add-on» بزنید و فایل <code>manifest.json</code> داخل پوشه را انتخاب کنید.',
      'یک تب جدید باز کنید.<span class="note">نصب موقت با بستن فایرفاکس حذف می‌شود؛ نصب دائمی به نسخه‌ی امضاشده توسط Mozilla نیاز دارد.</span>',
    ],
    privacyItems: [
      'کارها، یادداشت‌ها، میان‌برها و تنظیمات فقط در حافظه‌ی همین مرورگر ذخیره می‌شوند. هیچ حساب کاربری یا سروری از طرف SBC در کار نیست.',
      'برای داده‌های زنده، افزونه مستقیم از سرویس‌های عمومی درخواست می‌گیرد: CoinGecko (قیمت ارزها)، Open-Meteo (آب و هوا)، ExchangeRate-API (نرخ ارزها)، country.is (آی‌پی شما)، خبرنامه‌ی sbc.om (اخبار) و سرویس آیکون گوگل (آیکون میان‌برها).',
      'افزونه به محتوای سایت‌ها، تاریخچه‌ی مرور، کیف پول یا کلیدهای خصوصی شما دسترسی ندارد.',
      'کد کامل افزونه در گیت‌هاب در دسترس است و می‌توانید آن را بررسی کنید.',
    ],
  },
  en: {
    pageTitle: 'SBC Start: everything in a new tab',
    title: 'SBC Start',
    words: ['crypto prices', "today's news", 'your tasks', 'the weather', 'your calendar'],
    wordsSr: "crypto prices, today's news, your tasks and the weather",
    statementTail: 'in every new tab',
    statementHead: 'Follow',
    downloadGroup: 'Download for your browser', otherBrowsers: 'Other browsers', otherChromium: 'Other Chromium browsers',
    version: 'Version', toolsCount: '12+', tools: 'Handy tools', free: 'Free', noSignup: 'No sign-up',
    f: { weather: 'Weather', news: 'News', calendar: 'Calendar', tasks: 'My tasks', prices: 'Prices', timer: 'Timer', clock: 'Clock', converter: 'Converter' },
    company: 'SBC · Senior Block Chain',
    about: 'About', contact: 'Contact', privacy: 'Privacy', github: 'GitHub', close: 'Close',
    downloadZip: 'Download the extension', allReleases: 'All releases', toggle: 'فارسی', privacyFull: 'Read the full privacy policy',
    features: {
      weather: ['Weather', 'Live temperature, humidity, wind and a five-day forecast for the city you choose, at a glance.'],
      news: ['Daily news', 'The latest SBC company news, product updates and project stories are always one click away.'],
      calendar: ['Calendar', 'Solar Hijri, Gregorian and Hijri dates side by side, with a monthly calendar to plan your days.'],
      tasks: ['My tasks', 'Keep your day on track with a simple to-do list and priorities, so nothing slips through the cracks.'],
      prices: ['Price list', 'Live Bitcoin and top crypto prices with 24-hour change. Pin your favourite coin to the top bar.'],
      timer: ['Focus timer', 'Stay on the task that matters with a Pomodoro timer. Other widgets step aside while it runs.'],
      clock: ['World clock', 'See the time in cities around the world side by side and schedule meetings with ease.'],
      converter: ['Converter', 'Convert between crypto and currencies like USD, EUR and OMR at live rates.'],
    },
    installTitle: 'Install on {b}',
    installLead: 'SBC Start is not in the browser stores yet. Install it straight from GitHub in four steps.',
    stepsChromium: [
      'Download the extension ZIP and extract it to a folder.',
      'Open <code>{url}</code> in the address bar and turn on “Developer mode”.',
      'Click “Load unpacked” and choose the extracted folder.',
      'Open a new tab. If the browser asks, choose “Keep it”.',
    ],
    stepsFirefox: [
      'Download the Firefox ZIP and extract it to a folder.',
      'Open <code>{url}</code> in the address bar.',
      'Click “Load Temporary Add-on” and choose the <code>manifest.json</code> file in that folder.',
      'Open a new tab.<span class="note">A temporary add-on is removed when Firefox closes; a permanent install needs a Mozilla-signed build.</span>',
    ],
    privacyItems: [
      'Tasks, notes, shortcuts and settings are stored only in this browser. There is no account and no SBC server involved.',
      'For live data the extension calls public services directly: CoinGecko (crypto prices), Open-Meteo (weather), ExchangeRate-API (currency rates), country.is (your IP), the sbc.om news feed (news) and Google’s favicon service (shortcut icons).',
      'The extension cannot read website content, your browsing history, wallets or private keys.',
      'The full source code is on GitHub for anyone to review.',
    ],
  },
};

const $ = sel => document.querySelector(sel);
let lang = 'en';

function glyph(name) {
  const b = BRAND[name];
  return b ? `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${b.color}"><path d="${b.path}"/></svg>` : '';
}

function pick(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

/* ---------------------------------------------------------------- rotating words */
let wordTimer = null;
function buildWords() {
  const box = $('#words');
  const words = T[lang].words;
  box.innerHTML = words.map((w, i) => `<span class="word${i === 0 ? ' on' : ''}">${w}</span>`).join('');
  clearInterval(wordTimer);
  let i = 0;
  wordTimer = setInterval(() => {
    const els = box.children;
    els[i].classList.remove('on');
    els[i].classList.add('out');
    const prev = i;
    setTimeout(() => els[prev]?.classList.remove('out'), 650);
    i = (i + 1) % els.length;
    els[i].classList.add('on');
  }, 2600);
  // English reads "Follow [word] in every new tab"; Persian puts the verb at the end.
  const statement = $('.statement');
  statement.querySelector('.statement-head')?.remove();
  if (T[lang].statementHead) {
    const head = document.createElement('span');
    head.className = 'statement-head';
    head.textContent = T[lang].statementHead;
    statement.prepend(head);
  }
}

/* ---------------------------------------------------------------- language */
function applyLang(next) {
  lang = T[next] ? next : 'en';
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage blocked */ }
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.title = T[lang].pageTitle;
  document.querySelectorAll('[data-i18n]').forEach(el => { const v = pick(T[lang], el.dataset.i18n); if (typeof v === 'string') el.textContent = v; });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { const v = pick(T[lang], el.dataset.i18nAria); if (v) el.setAttribute('aria-label', v); });
  const toggle = $('#lang-toggle');
  toggle.textContent = T[lang].toggle;
  toggle.lang = lang === 'fa' ? 'en' : 'fa';
  buildWords();
}

/* ---------------------------------------------------------------- dialogs */
function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { dialog.close(); return; }
    const r = dialog.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dialog.close();
  });
});

function openFeature(key) {
  const [title, desc] = T[lang].features[key];
  $('#feature-title').textContent = title;
  $('#feature-desc').textContent = desc;
  const img = $('#feature-img');
  img.src = `site/previews/${lang}/${key}.jpg`;
  img.alt = title;
  openDialog($('#feature-modal'));
}

function openInstall(key) {
  const b = BROWSERS[key];
  const name = b[lang];
  $('#install-glyph').innerHTML = glyph(b.glyph);
  $('#install-title').textContent = T[lang].installTitle.replace('{b}', name);
  $('#install-lead').textContent = T[lang].installLead;
  const steps = b.firefox ? T[lang].stepsFirefox : T[lang].stepsChromium;
  $('#install-steps').innerHTML = steps.map(s => `<li><span>${s.replace('{url}', b.url)}</span></li>`).join('');
  $('#install-download').href = b.firefox ? ZIP.firefox : ZIP.chromium;
  openDialog($('#install-modal'));
}

function openPrivacy() {
  $('#privacy-list').innerHTML = T[lang].privacyItems.map(s => `<li>${s}</li>`).join('');
  openDialog($('#privacy-modal'));
}

/* ---------------------------------------------------------------- wiring */
document.querySelectorAll('[data-glyph]').forEach(el => { el.innerHTML = glyph(el.dataset.glyph); });
$('#version').textContent = VERSION;

const more = $('#dl-more');
const dropdown = $('#dl-dropdown');
const setDropdown = open => { dropdown.hidden = !open; more.setAttribute('aria-expanded', String(open)); };
more.addEventListener('click', e => { e.stopPropagation(); setDropdown(dropdown.hidden); });
document.addEventListener('click', e => { if (!dropdown.hidden && !e.target.closest('.dl-menu')) setDropdown(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setDropdown(false); });

document.querySelectorAll('[data-browser]').forEach(btn => btn.addEventListener('click', () => { setDropdown(false); openInstall(btn.dataset.browser); }));
document.querySelectorAll('[data-feature]').forEach(btn => btn.addEventListener('click', () => openFeature(btn.dataset.feature)));
$('#privacy-link').addEventListener('click', openPrivacy);
$('#lang-toggle').addEventListener('click', () => applyLang(lang === 'fa' ? 'en' : 'fa'));

let initial = new URLSearchParams(location.search).get('lang');
if (!initial) { try { initial = localStorage.getItem(LANG_KEY); } catch { /* storage blocked */ } }
applyLang(initial || 'en');
