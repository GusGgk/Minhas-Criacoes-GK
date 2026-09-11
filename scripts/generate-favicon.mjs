/**
 * Builds the icon set from public/gk-mark.png, the same white-on-transparent
 * glyph the portfolio uses, so both sites carry one mark.
 *
 * Two shapes come out of it:
 *
 *  - favicon.svg: the glyph alone on transparency. It carries a
 *    prefers-color-scheme rule, so the tab shows it near-black on a light
 *    browser and off-white on a dark one — the "transparent, in contrast with
 *    whatever is behind" version. Browsers that understand SVG icons pick
 *    this one first.
 *
 *  - the PNGs and the .ico: the glyph in white on a dark rounded tile. A
 *    raster cannot follow the theme, and a home-screen icon needs its own
 *    ground anyway, so these match the portfolio's favicon exactly.
 *
 * The mark only exists at 164x123. The 512 tile stretches that about 2x, which
 * is soft up close but is only ever seen on a PWA splash; hand this script a
 * vector one day and the whole set sharpens.
 *
 * Usage: npm run assets:favicon
 */
import { readFile, writeFile } from 'node:fs/promises';
import { deflateSync, inflateSync } from 'node:zlib';

const MARK = new URL('../public/gk-mark.png', import.meta.url);
const TILE = [11, 12, 11]; // --surface-1
const INK = [242, 238, 231]; // --fg

/* ---------- PNG in ---------- */

function decodePng(buffer) {
  let offset = 8;
  const idat = [];
  let width = 0;
  let height = 0;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === 'IHDR') {
      width = buffer.readUInt32BE(offset + 8);
      height = buffer.readUInt32BE(offset + 12);
      if (buffer[offset + 16] !== 8 || buffer[offset + 17] !== 6) throw new Error('gk-mark.png precisa ser RGBA de 8 bits.');
    }
    if (type === 'IDAT') idat.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const pixels = Buffer.alloc(width * height * 4);
  let previous = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride));
    for (let i = 0; i < stride; i += 1) {
      const left = i >= 4 ? line[i - 4] : 0;
      const up = previous[i];
      const upLeft = i >= 4 ? previous[i - 4] : 0;
      let value = line[i];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value += (pa <= pb && pa <= pc) ? left : (pb <= pc ? up : upLeft);
      }
      line[i] = value & 255;
    }
    line.copy(pixels, y * stride);
    previous = line;
  }
  return { width, height, pixels };
}

/* ---------- PNG out ---------- */

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function encodePng(size, pixels) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    Buffer.from(pixels.buffer, y * size * 4, size * 4).copy(raw, row + 1);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function makeIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = size === 256 ? 0 : size;
  header[7] = size === 256 ? 0 : size;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

/* ---------- drawing ---------- */

/** Bilinear read of the mark's alpha at a fractional source coordinate. */
function sampleAlpha(mark, x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const at = (px, py) => {
    if (px < 0 || py < 0 || px >= mark.width || py >= mark.height) return 0;
    return mark.pixels[(py * mark.width + px) * 4 + 3];
  };
  const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
  const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
  return (top * (1 - fy) + bottom * fy) / 255;
}

/** 0..1 coverage of a rounded square that fills the whole canvas. */
function tileCoverage(x, y, size, radius) {
  const cx = Math.max(radius, Math.min(size - radius, x));
  const cy = Math.max(radius, Math.min(size - radius, y));
  const distance = Math.hypot(x - cx, y - cy);
  return Math.max(0, Math.min(1, radius - distance + 0.5));
}

/** The glyph in ink on a dark rounded tile, supersampled 4x for clean edges. */
function makeTile(mark, size) {
  const scale = 4;
  const source = size * scale;
  const radius = size * 0.22 * scale;
  // The mark sits at 68% of the tile width, the same air the portfolio gives it.
  const glyphWidth = size * 0.68 * scale;
  const glyphHeight = glyphWidth * (mark.height / mark.width);
  const glyphX = (source - glyphWidth) / 2;
  const glyphY = (source - glyphHeight) / 2;
  const toSource = glyphWidth / mark.width;

  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sum = [0, 0, 0, 0];
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          const px = x * scale + sx + 0.5;
          const py = y * scale + sy + 0.5;
          const tile = tileCoverage(px, py, source, radius);
          if (tile <= 0) continue;
          const inside = px >= glyphX && px < glyphX + glyphWidth && py >= glyphY && py < glyphY + glyphHeight;
          const ink = inside ? sampleAlpha(mark, (px - glyphX) / toSource - 0.5, (py - glyphY) / toSource - 0.5) : 0;
          for (let channel = 0; channel < 3; channel += 1) {
            sum[channel] += (TILE[channel] * (1 - ink) + INK[channel] * ink) * tile;
          }
          sum[3] += 255 * tile;
        }
      }
      const offset = (y * size + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) pixels[offset + channel] = Math.round(sum[channel] / (scale * scale));
    }
  }
  return encodePng(size, pixels);
}

/** The glyph alone, following the browser's colour scheme. */
function makeSvg(markPng, mark) {
  // Square canvas with the mark centred at 84% width; the alpha of the PNG is
  // the mask, so the fill colour below is the only thing the theme changes.
  const box = 100;
  const width = 84;
  const height = width * (mark.height / mark.width);
  const x = (box - width) / 2;
  const y = (box - height) / 2;
  const data = markPng.toString('base64');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}">`,
    '  <style>',
    `    rect { fill: #${INK.map((c) => c.toString(16).padStart(2, '0')).join('')}; }`,
    '    @media (prefers-color-scheme: light) { rect { fill: #191612; } }',
    '  </style>',
    `  <mask id="gk" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="${box}" height="${box}">`,
    `    <image href="data:image/png;base64,${data}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width}" height="${height.toFixed(2)}" />`,
    '  </mask>',
    `  <rect width="${box}" height="${box}" mask="url(#gk)" />`,
    '</svg>',
    '',
  ].join('\n');
}

/* ---------- run ---------- */

const markPng = await readFile(MARK);
const mark = decodePng(markPng);

const out = (name) => new URL(`../public/${name}`, import.meta.url);
const favicon48 = makeTile(mark, 48);
await writeFile(out('favicon.svg'), makeSvg(markPng, mark));
await writeFile(out('favicon.ico'), makeIco(favicon48, 48));
await writeFile(out('favicon-48.png'), favicon48);
await writeFile(out('favicon-192.png'), makeTile(mark, 192));
await writeFile(out('favicon-512.png'), makeTile(mark, 512));
await writeFile(out('apple-touch-icon.png'), makeTile(mark, 180));
console.log(`Icon set built from the ${mark.width}x${mark.height} GK mark.`);
