// Generates the original "silk ribbon" wallpapers used by the new tab and the landing page.
// Run with: npm run wallpapers  (outputs to src/assets/wallpapers/*.svg)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1920, H = 1080;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/assets/wallpapers');

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n = v => Math.round(v * 10) / 10;

// A ribbon is two smooth cubic segments: P0 C1 C2 P1 (C3 = mirror of C2) C4 P2.
// Each strand moves every control point along its own spread vector, so strands
// fan out, cross and twist like silk.
const RIBBONS = {
  left: {
    pts: [[-180, 1000], [250, 880], [380, 690], [560, 520], [820, 180], [1060, -140]],
    spread: [[0, 190], [-130, -260], [180, 120], [-90, 60], [230, -120], [-80, 260]],
  },
  leftWisp: {
    pts: [[-200, 760], [180, 700], [300, 560], [470, 440], [700, 210], [980, 40]],
    spread: [[0, 90], [-60, -120], [80, 60], [-40, 30], [100, -60], [-30, 120]],
  },
  right: {
    pts: [[600, 1220], [950, 1080], [1160, 900], [1400, 640], [1650, 300], [2110, 200]],
    spread: [[-120, 160], [160, -230], [-190, 80], [70, -100], [-180, 260], [90, -280]],
  },
  rightWisp: {
    pts: [[860, 1220], [1180, 1080], [1330, 860], [1560, 700], [1760, 560], [2120, 470]],
    spread: [[-60, 80], [80, -120], [-90, 40], [36, -50], [-90, 120], [40, -130]],
  },
};

function strandPath(r, t, wobble) {
  const p = r.pts.map((pt, i) => [pt[0] + r.spread[i][0] * t + wobble[i][0], pt[1] + r.spread[i][1] * t + wobble[i][1]]);
  const c3 = [2 * p[3][0] - p[2][0], 2 * p[3][1] - p[2][1]];
  return `M${n(p[0][0])} ${n(p[0][1])}C${n(p[1][0])} ${n(p[1][1])} ${n(p[2][0])} ${n(p[2][1])} ${n(p[3][0])} ${n(p[3][1])}C${n(c3[0])} ${n(c3[1])} ${n(p[4][0])} ${n(p[4][1])} ${n(p[5][0])} ${n(p[5][1])}`;
}

function cubic(a, b, c, d, s) {
  const u = 1 - s;
  return [0, 1].map(k => u * u * u * a[k] + 3 * u * u * s * b[k] + 3 * u * s * s * c[k] + s * s * s * d[k]);
}
function pointOn(r, s) {
  const p = r.pts, c3 = [2 * p[3][0] - p[2][0], 2 * p[3][1] - p[2][1]];
  return s < .5 ? cubic(p[0], p[1], p[2], p[3], s * 2) : cubic(p[3], c3, p[4], p[5], s * 2 - 1);
}

function ribbon(id, r, colors, rand, { count = 34, glow = 1 } = {}) {
  const [deep, mid, light] = colors;
  const [x1, y1] = r.pts[0], [x2, y2] = r.pts[5];
  const grad = `<linearGradient id="g-${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
<stop offset="0" stop-color="${deep}" stop-opacity="0"/><stop offset=".22" stop-color="${deep}" stop-opacity=".85"/><stop offset=".48" stop-color="${mid}"/><stop offset=".62" stop-color="${light}"/><stop offset=".8" stop-color="${mid}" stop-opacity=".8"/><stop offset="1" stop-color="${deep}" stop-opacity="0"/></linearGradient>`;
  const zero = r.pts.map(() => [0, 0]);
  const base = strandPath(r, 0, zero);
  let strands = '';
  for (let i = 0; i < count; i++) {
    const t = -1 + (2 * i) / (count - 1) + (rand() - .5) * .06;
    const wobble = r.pts.map(() => [(rand() - .5) * 16, (rand() - .5) * 16]);
    const centre = 1 - t * t;
    const op = n((.08 + centre * .5 + rand() * .12) * (glow < 1 ? .8 : 1));
    const w = n(.6 + centre * 1.4 + rand() * .5);
    strands += `<path d="${strandPath(r, t, wobble)}" stroke-width="${w}" stroke-opacity="${op}"/>`;
  }
  let dust = '';
  for (let i = 0; i < Math.round(70 * glow); i++) {
    const [px, py] = pointOn(r, .12 + rand() * .76);
    const spread = 40 + rand() * 220;
    const a = rand() * Math.PI * 2;
    const x = px + Math.cos(a) * spread, y = py + Math.sin(a) * spread;
    const big = rand() > .86;
    dust += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(big ? 1.6 + rand() * 1.8 : .5 + rand() * 1.1)}" fill="${rand() > .5 ? light : mid}" opacity="${n(.15 + rand() * .7)}"${big ? ' filter="url(#soft)"' : ''}/>`;
  }
  return {
    defs: grad,
    body: `<g fill="none" stroke-linecap="round">
<path d="${base}" stroke="${mid}" stroke-width="${n(380 * glow)}" opacity="${n(.22 * glow)}" filter="url(#haze)"/>
<path d="${base}" stroke="url(#g-${id})" stroke-width="${n(150 * glow)}" opacity="${n(.42 * glow)}" filter="url(#glow)"/>
<g stroke="url(#g-${id})" filter="url(#fine)">${strands}</g>
<path d="${base}" stroke="${light}" stroke-width="${n(4 * glow)}" opacity="${n(.5 * glow)}" filter="url(#core)"/>
</g><g>${dust}</g>`,
  };
}

function wallpaper({ seed, bg, left, right, bloom }) {
  const rand = rng(seed);
  const a = ribbon('l', RIBBONS.left, left, rand);
  const a2 = ribbon('lw', RIBBONS.leftWisp, left, rand, { count: 16, glow: .55 });
  const b = ribbon('r', RIBBONS.right, right, rand);
  const b2 = ribbon('rw', RIBBONS.rightWisp, right, rand, { count: 16, glow: .55 });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="${bg[0]}"/><stop offset=".55" stop-color="${bg[1]}"/><stop offset="1" stop-color="${bg[2]}"/></radialGradient>
<radialGradient id="bloom" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${bloom}" stop-opacity=".32"/><stop offset="1" stop-color="${bloom}" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<filter id="haze" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="110"/></filter>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="34"/></filter>
<filter id="fine" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".7"/></filter>
<filter id="core" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.4"/></filter>
<filter id="soft" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="1.4"/></filter>
${a.defs}${a2.defs}${b.defs}${b2.defs}
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<ellipse cx="960" cy="330" rx="720" ry="420" fill="url(#bloom)"/>
${a2.body}
${a.body}
${b2.body}
${b.body}
<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>
`;
}

const PALETTES = {
  aurora: { seed: 11, bg: ['#1f0c38', '#0c0619', '#030208'], bloom: '#5b2a9c', left: ['#7a1fa8', '#cf5cf6', '#f6c8ff'], right: ['#2436c4', '#5878ff', '#cad6ff'] },
  ocean: { seed: 23, bg: ['#0b2550', '#06132a', '#020814'], bloom: '#0f4c8a', left: ['#0a4fa6', '#0098ea', '#c4ecff'], right: ['#2a3dbd', '#406ae4', '#d2dcff'] },
  emerald: { seed: 37, bg: ['#082c25', '#041512', '#010605'], bloom: '#0f5a4a', left: ['#0f766e', '#2dd4bf', '#d1fff6'], right: ['#166534', '#4ade80', '#e0ffe9'] },
  ember: { seed: 51, bg: ['#2d0d18', '#13060b', '#050203'], bloom: '#6b1d2c', left: ['#a3123a', '#fb7185', '#ffe1e6'], right: ['#b8400c', '#fb923c', '#ffeedd'] },
};

mkdirSync(OUT, { recursive: true });
for (const [name, palette] of Object.entries(PALETTES)) {
  const svg = wallpaper(palette);
  writeFileSync(resolve(OUT, `${name}.svg`), svg);
  console.log(`${name}.svg ${(svg.length / 1024).toFixed(1)} KB`);
}
