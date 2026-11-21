# SBC Start

A browser **New Tab** extension and its landing page, built for Senior Block Chain LLC (SBC). English is the default language; Persian (right-to-left, with the Jalali calendar) is one click away in Settings and on the landing page.

## The new tab

- Big clock with two switchable cities, the date in the Solar Hijri (Jalali) calendar, and a web search bar (Google, DuckDuckGo or Bing) with a shortcuts button.
- **Top bar:** tools launcher, SBC news and weather on one side; the focus timer in the middle; the live crypto ticker, price alerts and converter on the other side.
- **Bottom bar:** my tasks and notes; wallpaper back, slideshow and next in the middle; your public IP, connection status and settings.
- Every item opens a frosted-glass popover: 5-day weather with city search, SBC news (one line per headline), a calendar showing Jalali, Gregorian and Hijri dates, 8-coin market list (click a coin to pin it to the ticker), price alerts, crypto/fiat converter, Pomodoro focus timer (other widgets fade while it runs), prioritised tasks, notes, world clock, shortcuts and settings.
- Five bundled wallpapers that work offline: four original "silk ribbon" artworks (`npm run wallpapers` regenerates them) and the official SBC meadow illustration.
- Settings are saved in `localStorage` and stay in sync across open tabs.

## The landing page

`index.html` + `site/` is a static page (no build step), modelled on the layout of extension.arzdigital.com: logo, title, rotating tagline, browser download buttons, a version/tools/price strip, eight feature tiles and a footer. Each feature tile opens a sheet with a real screenshot of the extension (`site/previews/{fa,en}/*.jpg`). Each browser button opens step-by-step install instructions and a download link to the latest release ZIP.

## Development

Requirements: Node.js 22+.

```bash
npm install
npm run dev          # http://localhost:5173/ (landing) and /newtab.html (extension)
npm run build        # bundles the new tab into dist/
npm run wallpapers   # regenerates src/assets/wallpapers/*.svg
```

To try the extension locally, run `npm run build`, copy `manifest.json` into `dist/`, then load `dist/` as an unpacked extension.

## Project layout

- `src/main.jsx`: new tab shell (bars, clock, search, popovers, focus, alert and slideshow logic)
- `src/panels.jsx`: every widget panel (weather, news, markets, alerts, converter, focus, tasks, notes, calendar, world clock, shortcuts, IP, settings)
- `src/api.js`: public data sources with a shared localStorage cache
- `src/store.js`: settings schema, migration from v1, cross-tab sync
- `src/i18n.js`, `src/dates.js`: Persian/English strings and Intl-based calendar helpers
- `src/wallpapers.js`, `src/assets/`: wallpapers and the SBC logo
- `src/brand-icons.js`: browser and search engine glyphs (Simple Icons, CC0), also used by the landing page
- `public/icons/`: extension icons
- `index.html`, `site/`: static landing page
- `.github/workflows/release.yml`, `.github/workflows/pages.yml`: release and Pages deployment

## Install

The extension is not in the browser stores yet. The landing page walks visitors through it:

- **Chrome, Edge, Brave, Opera, Vivaldi:** download `sbc-start-chromium.zip`, extract it, open the browser's extensions page, enable Developer mode, choose **Load unpacked** and select the folder.
- **Firefox:** download `sbc-start-firefox.zip`, extract it, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on** and pick `manifest.json`. A permanent install needs a Mozilla-signed build.

## Release process

1. Set the same version in `package.json`, `manifest.json` and `site/landing.js` (`VERSION`). CI fails if they differ.
2. Commit and push to `main`.
3. GitHub Actions builds the extension and creates release `vX.Y.Z` with versioned ZIPs plus stable `sbc-start-chromium.zip` / `sbc-start-firefox.zip`, which the landing page links to through `releases/latest/download/`.
4. Pushes without a version change upload a build artifact but do not create a release.

## GitHub Pages

The landing page is served as-is from the repository, so it looks the same whether Pages uses branch publishing or the `pages.yml` workflow (which copies `index.html`, `site/` and the few assets it uses). `.nojekyll` keeps branch publishing from processing files.

https://sbc-apps.github.io/sbc-extension/

## Privacy and permissions

The extension asks only for `storage`. Tasks, notes, shortcuts and settings never leave the browser; there is no account and no SBC server. For live data it calls these public services directly:

| Data | Service |
| --- | --- |
| Crypto prices, alerts, converter | CoinGecko |
| Weather and city search | Open-Meteo |
| Currency rates | ExchangeRate-API (open.er-api.com) |
| Public IP and country | country.is |
| News | sbc.om news RSS feed |
| Shortcut icons | Google favicon service |

Price alerts are checked while an SBC Start tab is open. Market data is informational only. The extension cannot read website content, browsing history, wallets or private keys.

© Senior Block Chain LLC.
