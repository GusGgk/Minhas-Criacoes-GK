/**
 * WCAG 2.1 contrast audit for the two site themes.
 *
 * Reads the token values straight out of app/globals.css and the accents out of
 * the content files, so the report can never drift from what ships. The light
 * theme darkens every accent through --accent-mix; this resolves that mix the
 * same way the browser does, then checks the result against the page surface.
 *
 * Run with: node scripts/check-contrast.mjs
 */
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const css = read('../app/globals.css');

/** Pulls `--name: value;` pairs out of the block belonging to one selector. */
function readTokens(selector) {
  const at = css.indexOf(`${selector} {`);
  if (at < 0) throw new Error(`selector ${selector} not found in globals.css`);
  const body = css.slice(at, css.indexOf('\n}', at));
  return Object.fromEntries([...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
}

/** Every accent the content can hand to a chapter, project or hero moment. */
function readAccents() {
  const sources = ['../lib/content/chapters.ts', '../lib/content/default-content.ts', '../lib/content/timeline.ts'];
  const found = new Map();
  for (const source of sources) {
    for (const [, hex] of read(source).matchAll(/accent:\s*'(#[0-9a-fA-F]{6})'/g)) found.set(hex.toLowerCase(), source);
  }
  // The Mirtillo blue only exists in the stylesheet, but runs through the same mix.
  found.set('#8ea0ff', 'globals.css');
  return [...found.keys()];
}

/** Resolves var() and color-mix() the way the browser would, against `tokens`. */
function resolve(value, tokens, depth = 0) {
  if (value == null || depth > 8) return null;
  const flat = value.trim().replace(/var\(\s*--([\w-]+)\s*\)/g, (whole, name) => tokens[name] ?? whole);
  const blend = flat.match(/^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+?)\s*\)$/);
  if (!blend) return parse(flat);
  const [, a, percent, b] = blend;
  const from = resolve(a, tokens, depth + 1);
  const to = resolve(b, tokens, depth + 1);
  return from && to ? mix(from, Number(percent) / 100, to) : null;
}

function parse(color) {
  const hex = color.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1);
  const rgba = color.match(/^rgba?\(([^)]+)\)$/);
  if (!rgba) return null;
  const [r, g, b, a = '1'] = rgba[1].split(',').map((part) => part.trim());
  return [Number(r), Number(g), Number(b), Number(a)];
}

/** Flattens a translucent colour over its backdrop, so hairlines get a real ratio. */
const flatten = ([r, g, b, a], over) => [r, g, b].map((channel, i) => channel * a + over[i] * (1 - a));

/** srgb color-mix(in srgb, colour <pct>, base), matching the browser. */
const mix = (colour, percent, base) => colour.map((channel, i) => channel * percent + base[i] * (1 - percent)).slice(0, 3).concat(1);

function luminance([r, g, b]) {
  const [rl, gl, bl] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function ratio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** token -> [minimum ratio, what it is used for] */
const TEXT = {
  fg: [4.5, 'primary text'],
  warm: [4.5, 'lead paragraphs'],
  'text-soft': [4.5, 'body copy'],
  muted: [4.5, 'small labels'],
  'text-dim': [4.5, 'mono labels'],
  'text-faint': [4.5, 'mono micro-labels'],
  'text-ghost': [4.5, 'mono index numbers'],
  'cta-fg': [4.5, 'primary CTA label'],
  'accent-ink': [4.5, 'brand accent as text'],
};
const NON_TEXT = {
  accent: [3, 'accent fill and focus ring'],
  live: [3, 'live status dot'],
  'line-strong': [1.4, 'stronger divider'],
  'card-border': [1.15, 'card edge'],
};

const themes = [
  { label: 'DARK ', tokens: readTokens(':root') },
  { label: 'LIGHT', tokens: { ...readTokens(':root'), ...readTokens("[data-theme='light']") } },
];

let failures = 0;
const fail = (message) => { failures += 1; console.log(message); };

for (const { label, tokens } of themes) {
  const bg = parse(tokens['surface-0']);
  console.log(`\n${label} — surface ${tokens['surface-0']}`);

  for (const [group, rules] of [['text', TEXT], ['ui', NON_TEXT]]) {
    for (const [name, [min, use]] of Object.entries(rules)) {
      const parsed = resolve(tokens[name], tokens);
      if (!parsed) { fail(`  ?? --${name} is missing or not a flat colour`); continue; }
      const value = ratio(flatten(parsed, bg), bg);
      const line = `  ${value >= min ? 'ok' : 'NO'} --${name.padEnd(13)} ${value.toFixed(2)}:1  (min ${min} — ${use}) [${group}]`;
      if (value >= min) console.log(line); else fail(line);
    }
  }

  // Content accents, after --accent-mix has darkened them for this theme.
  const percent = Number(tokens['accent-mix'].replace('%', '')) / 100;
  const base = parse(tokens['accent-mix-base']);
  console.log(`  accents as text (--accent-mix ${tokens['accent-mix']}):`);
  for (const accent of readAccents()) {
    const value = ratio(mix(parse(accent), percent, base), bg);
    const line = `    ${value >= 4.5 ? 'ok' : 'NO'} ${accent}  ${value.toFixed(2)}:1  (min 4.5)`;
    if (value >= 4.5) console.log(line); else fail(line);
  }
}

console.log(failures === 0 ? '\nEvery token and accent meets its target.\n' : `\n${failures} below target.\n`);
process.exit(failures === 0 ? 0 : 1);
