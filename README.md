# SBC Start

A customizable **New Tab** dashboard and landing page for modern browsers, built for Senior Blockchain Company LLC. Inspired by the *feature categories* of the ArzDigital browser extension, with an original SBC visual design.

## Features

- Full-page New Tab replacement with web search and live clock
- Live public crypto market watch via CoinGecko, with clear error states and no fabricated prices
- Weather via Open-Meteo (predefined cities, no automatic geolocation)
- Tasks and customizable shortcuts stored locally
- Focus timer, monthly calendar, four world clocks
- Widget visibility, search engine, weather unit and light/dark theme settings
- Original responsive marketing landing page
- Animate UI provider from `@animate-ui/react` and Motion transitions
- Automatic GitHub Release on **version change**, not on every code commit

## Development

Requirements: Node.js 22+.

```bash
npm install
npm run dev
npm run build
```

The release workflow builds with Vite and adds `manifest.json` to `dist/`. To test locally, run `npm run build` and copy `manifest.json` to `dist/` (or use the ZIP from Releases).

- New tab: `http://localhost:5173/`
- Landing page: `http://localhost:5173/landing.html`
- Distribution: `dist/`

## Install unpacked

**Chrome, Edge, Brave, Opera (Chromium):** Open the browser's extension management page, enable developer mode, choose **Load unpacked**, and select `dist/` after copying the manifest. Confirm the New Tab replacement prompt when shown.

**Firefox:** Use `about:debugging#/runtime/this-firefox` > Load Temporary Add-on > choose `dist/manifest.json`. Permanent installation normally requires Mozilla signing. Browser-specific review, packaging and signing may be needed for official distribution. Safari needs a separate Safari Web Extension conversion and signing through Apple's tooling and is **not** built by this repository.

## Release process

1. Update the version in **both** `package.json` and `manifest.json` to the same new semantic version (for example `1.0.1`).
2. Commit and push to `main`.
3. GitHub Actions checks version consistency, builds, and creates release `v1.0.1` with downloadable ZIP packages.
4. Commits without a version change build an artifact but **do not** create a new GitHub Release.
5. Review the browser's installation and store rules before distributing. A GitHub Release does not automatically update installed browser extensions; browser stores require separate publication processes.

The Firefox and Chromium archives currently share the same Manifest V3 application code. Packaging separately makes browser-specific changes possible later.

## Privacy and permissions

SBC Start requires `storage` permission and host access to CoinGecko and Open-Meteo for data requests. All tasks, shortcuts, widget visibility, preferred city and appearance are stored in localStorage for this extension origin. There is no account or server sync. The dashboard does **not** access wallets, private keys or website content. Market quotes are for information only; availability and rate limits depend on the public provider. Avoid putting confidential information in task titles.

## Architecture

- `src/main.jsx`: New Tab UI and widgets
- `src/landing.jsx`: product landing
- `src/store.js`: settings persistence
- `src/style.css`: responsive design system
- `manifest.json`: browser extension metadata
- `.github/workflows/release.yml`: build and release

## Browser coverage

Designed for current Chromium browsers and Firefox with Manifest V3 New Tab support. Actual behavior must be tested in each browser. Safari requires its own signed conversion pipeline. No blanket compatibility claim is made.

© Senior Blockchain Company LLC.


## GitHub Pages

The standalone marketing site is built from `landing.html` and deployed by `.github/workflows/pages.yml` to:

https://sbc-apps.github.io/sbc-extension/

In **Settings → Pages → Build and deployment**, set **Source: GitHub Actions** once. The workflow automatically publishes the landing page after subsequent pushes to `main`. The deployment intentionally excludes `manifest.json`, so visitors get the public landing site rather than the extension's New Tab entry point.

The landing preview contains clearly labeled illustrative prices and weather, not live financial quotes. The extension itself fetches market and weather data when available.


## Official SBC brand alignment (v1.3.0)

The landing page and browser new tab use the official guidelines at https://sbc.om/brand/: unchanged SBC logo (https://sbc.om/logo.svg), SBC Blue #0098EA for the mark, Royal #406AE4 to Azure #3B82F6 for interface icon circles, Navy #06132A for dark surfaces, Bricolage Grotesque for headings and Inter for UI text. The full-screen illustrated meadow background is hosted on the SBC website and is used instead of a city stock photo. The official logo and background are loaded from sbc.om; for guaranteed offline rendering, the brand owners may later bundle the official image assets with the extension. No scrolling is introduced in the primary view.
