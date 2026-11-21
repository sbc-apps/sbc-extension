# Chrome Web Store submission: SBC Start

Everything needed to fill in the Chrome Web Store Developer Dashboard, field by field.

## 1. Package to upload

`sbc-start-v1.5.2-chromium.zip` from the v1.5.2 GitHub release (created automatically after the version bump is pushed to `main`). It is the Chromium build: the manifest has no Firefox-only keys and requests `storage` and `search`.

## 2. Store listing tab

| Field | Value |
| --- | --- |
| Name | SBC Start: Your New Tab (from `manifest.json`) |
| Summary | A new tab with crypto prices, price alerts, converter, SBC news, weather, Jalali calendar, tasks, notes and a focus timer. (from `manifest.json`, 122 characters) |
| Category | Productivity › Workflow & planning (alternative: Make Chrome yours › Functionality & UI) |
| Language | English |
| Store icon (128×128) | `public/icons/icon-128.png` |
| Screenshots (1280×800) | `store/screenshots/1-new-tab.png` to `5-focus.png` |
| Small promo tile (440×280) | `store/promo-small-440x280.png` |
| Marquee promo tile (1400×560) | `store/promo-marquee-1400x560.png` |
| Homepage URL | https://extension.sbc.om/ |
| Support URL | https://sbc.om/contact/ |
| Official URL | https://sbc.om (only after the site is verified for this account in Google Search Console; otherwise leave empty) |

### Description

```
SBC Start turns every new tab into a calm, useful dashboard.

WHAT YOU GET
• A big clock with two cities you can switch between, and today's date
• Search with your browser’s default search provider, or type a web address
• A live crypto ticker in the top bar, with a full list of top coins and their 24-hour change
• Price alerts that tell you when a coin goes above or below your target (checked while SBC Start is open)
• A converter between crypto and currencies such as USD, EUR, GBP, AED and OMR
• Weather for any city, with a five-day forecast
• SBC News headlines
• A calendar with Gregorian, Solar Hijri (Jalali) and Hijri dates
• My tasks with priorities, plus quick notes
• A Pomodoro focus timer: other widgets fade away while you work
• World clock, your favourite shortcuts, and your public IP with connection status
• Five wallpapers with an optional slideshow
• English and Persian (right-to-left) interface

PRIVATE BY DESIGN
• No account, no ads, no analytics, no tracking
• Your tasks, notes and settings stay in your browser
• Only two permissions: storage and browser search

Live data comes from public services (CoinGecko, Open-Meteo, ExchangeRate-API, country.is and sbc.om). Prices are for information only and are not financial advice.

Made by Senior Block Chain LLC (SBC), Muscat, Oman.
Privacy policy: https://extension.sbc.om/privacy.html
```

## 3. Privacy practices tab

**Single purpose**

```
SBC Start replaces the browser's new tab page with a personal dashboard: clock, search, crypto prices, weather, news, tasks, notes and a focus timer.
```

**Permission justification**

| Permission | Justification |
| --- | --- |
| storage | Saves the user's tasks, notes, shortcuts, price alerts and settings locally in the browser so they persist between new tabs. |
| search | Uses the browser’s configured default search provider for queries typed into the new-tab search box. |

There are no host permissions to justify.

**Remote code:** No, I am not using remote code. All JavaScript is bundled in the package; network requests only fetch JSON, RSS and images.

**Data usage.** Recommended answers (conservative, so the listing matches what the extension actually sends):

- Tick **Location**: the city the user picks is sent to Open-Meteo to get the weather, and the extension shows the user's public IP and country (from country.is).
- Leave every other category unticked. Tasks, notes and settings never leave the browser, and there is no analytics.
- Tick all three certifications: data is not sold to third parties, not used for purposes unrelated to the single purpose, and not used to determine creditworthiness or for lending.

**Privacy policy URL:** https://extension.sbc.om/privacy.html

## 4. Distribution tab

- Payments: Free
- Visibility: Public
- Regions: All regions

## 5. Test instructions for the reviewer (optional)

```
No login or setup is needed. After installing, open a new tab. Every item in the top and bottom bars opens a panel; Settings (gear icon, bottom corner) switches the language to Persian.
```

## 6. Account requirements (one-time)

- Register a developer account at https://chrome.google.com/webstore/devconsole with the Google account that should own the listing (a company account is better than a personal one). Registration costs a one-time US$5 fee.
- 2-Step Verification must be on for that Google account.
- Verify the contact email shown in the dashboard.
- Trader declaration (EU Digital Services Act): SBC is a company, so declare **trader** and provide the business address, phone and email. These are shown to users in the EU.

## 7. After approval

- Copy the listing URL (`https://chromewebstore.google.com/detail/<item-id>`). Point the landing page's Chrome, Brave, Opera, Vivaldi and Chromium buttons to it instead of the ZIP download.
- For each update: bump the version in `package.json`, `manifest.json` and `site/landing.js`, push, then upload the new `sbc-start-vX.Y.Z-chromium.zip` under **Package** in the dashboard and submit for review. This step can be automated later with the Chrome Web Store API.

## Regenerating the images

- Screenshots: open `newtab.html` at a 1280×800 viewport and capture the page with a panel open.
- Promo tiles: open `store/promo/small.html` and `store/promo/marquee.html` (through `npm run dev`) at exactly 440×280 and 1400×560 and capture the viewport.
