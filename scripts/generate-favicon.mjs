import { writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

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

function insideCapsule(px, py, ax, ay, bx, by, radius) {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSquared = abx * abx + aby * aby;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSquared));
  const dx = px - (ax + abx * t);
  const dy = py - (ay + aby * t);
  return dx * dx + dy * dy <= radius * radius;
}

function makePng(size) {
  const scale = 4;
  const sourceSize = size * scale;
  const source = new Uint8Array(sourceSize * sourceSize * 4);
  const lines = [
    [48, 57, 96, 57, 8, [243, 236, 226]],
    [45, 59, 45, 134, 8, [243, 236, 226]],
    [48, 137, 96, 137, 8, [243, 236, 226]],
    [94, 101, 94, 135, 8, [243, 236, 226]],
    [76, 101, 96, 101, 8, [243, 236, 226]],
    [116, 56, 116, 138, 8, [255, 107, 74]],
    [120, 100, 155, 58, 8, [255, 107, 74]],
    [120, 99, 158, 138, 8, [255, 107, 74]],
  ];

  for (let y = 0; y < sourceSize; y += 1) {
    for (let x = 0; x < sourceSize; x += 1) {
      const ux = (x + 0.5) / scale;
      const uy = (y + 0.5) / scale;
      const cx = ux - 96;
      const cy = uy - 96;
      const radius = Math.hypot(cx, cy);
      const offset = (y * sourceSize + x) * 4;
      if (radius <= 91) {
        const glow = Math.max(0, 1 - Math.hypot(ux - 150, uy - 35) / 120);
        source[offset] = 8 + Math.round(glow * 10);
        source[offset + 1] = 9 + Math.round(glow * 4);
        source[offset + 2] = 8;
        source[offset + 3] = 255;
      }
      if (radius > 84 && radius <= 87) {
        source[offset] = 55; source[offset + 1] = 53; source[offset + 2] = 49; source[offset + 3] = 255;
      }
      for (const [ax, ay, bx, by, lineRadius, color] of lines) {
        if (insideCapsule(ux, uy, ax, ay, bx, by, lineRadius)) {
          source[offset] = color[0]; source[offset + 1] = color[1]; source[offset + 2] = color[2]; source[offset + 3] = 255;
        }
      }
      if (Math.hypot(ux - 151, uy - 35) <= 8) {
        source[offset] = 255; source[offset + 1] = 107; source[offset + 2] = 74; source[offset + 3] = 255;
      }
    }
  }

  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sum = [0, 0, 0, 0];
      for (let sy = 0; sy < scale; sy += 1) for (let sx = 0; sx < scale; sx += 1) {
        const sourceOffset = (((y * scale + sy) * sourceSize) + x * scale + sx) * 4;
        for (let channel = 0; channel < 4; channel += 1) sum[channel] += source[sourceOffset + channel];
      }
      const targetOffset = (y * size + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) pixels[targetOffset + channel] = Math.round(sum[channel] / (scale * scale));
    }
  }

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

const favicon48 = makePng(48);
await writeFile(new URL('../public/favicon.ico', import.meta.url), makeIco(favicon48, 48));
await writeFile(new URL('../public/favicon-48.png', import.meta.url), favicon48);
await writeFile(new URL('../public/favicon-192.png', import.meta.url), makePng(192));
await writeFile(new URL('../public/favicon-512.png', import.meta.url), makePng(512));
await writeFile(new URL('../public/apple-touch-icon.png', import.meta.url), makePng(180));
console.log('Generated the GK favicon set.');
