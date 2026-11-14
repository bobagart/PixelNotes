// Generates the PixelNotes logo (a pixel paper with a pixel pen) as icons/logo.svg and the PNG app icons.
// Run: node tools/make-icons.js   (no dependencies)
const fs = require('fs'), zlib = require('zlib'), path = require('path');

const N = 16;
const C = { o: '#1f1d36', w: '#fffdf5', g: '#a8e6cf', p: '#ff6b9d', y: '#ffd166', s: '#1f1d36' };
const BG = '#ffe9a8';

// 16x16 grid of palette letters ('.' = transparent)
const grid = Array.from({ length: N }, () => Array(N).fill('.'));
const set = (x, y, c) => { if (x >= 0 && x < N && y >= 0 && y < N) grid[y][x] = c; };

// paper: outline cols 1-11, rows 1-14, with mint ruled lines
for (let y = 1; y <= 14; y++) for (let x = 1; x <= 11; x++) set(x, y, (x === 1 || x === 11 || y === 1 || y === 14) ? 'o' : 'w');
for (const y of [3, 5, 7, 9, 11]) for (let x = 3; x <= 9; x++) set(x, y, 'g');

// pen: runs diagonally from top right to a tip resting on the paper
for (let i = 0; i <= 5; i++) {            // body
  set(15 - i, 1 + i, 'o'); set(14 - i, 1 + i, 'p'); set(13 - i, 1 + i, 'p'); set(12 - i, 1 + i, 'o');
}
set(14, 0, 'o'); set(13, 0, 'o');          // cap
set(9, 7, 'o'); set(8, 7, 'y'); set(7, 7, 'y'); set(6, 7, 'o');   // tip
set(8, 8, 'o'); set(7, 8, 'y'); set(6, 8, 'o');
set(7, 9, 'o'); set(6, 9, 's'); set(5, 9, 'o');
set(6, 10, 'o');

function rects(offset, cell) {
  let out = '';
  grid.forEach((row, y) => row.forEach((c, x) => {
    if (c !== '.') out += `<rect x="${(x + offset) * cell}" y="${(y + offset) * cell}" width="${cell}" height="${cell}" fill="${C[c]}"/>`;
  }));
  return out;
}

const root = path.join(__dirname, '..', 'icons');
fs.mkdirSync(root, { recursive: true });

// transparent logo for the sidebar and favicon
fs.writeFileSync(path.join(root, 'logo.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="64" height="64" shape-rendering="crispEdges">${rects(0, 1)}</svg>\n`);

// PNG encoder (RGBA, no dependencies)
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = buf => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

// icon = logo centred on a solid tile, 'pad' empty cells on each side (extra padding keeps maskable icons safe)
function png(size, pad) {
  const units = N + pad * 2, raw = Buffer.alloc((size * 4 + 1) * size);
  for (let Y = 0; Y < size; Y++) {
    raw[Y * (size * 4 + 1)] = 0;
    for (let X = 0; X < size; X++) {
      const gx = Math.floor(X * units / size) - pad, gy = Math.floor(Y * units / size) - pad;
      const c = gx >= 0 && gx < N && gy >= 0 && gy < N && grid[gy][gx] !== '.' ? C[grid[gy][gx]] : BG;
      const [r, g, b] = hex(c), o = Y * (size * 4 + 1) + 1 + X * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

fs.writeFileSync(path.join(root, 'icon-192.png'), png(192, 4));
fs.writeFileSync(path.join(root, 'icon-512.png'), png(512, 4));
fs.writeFileSync(path.join(root, 'icon-maskable-512.png'), png(512, 8));
fs.writeFileSync(path.join(root, 'apple-touch-icon.png'), png(180, 4));
console.log('icons written to', root);
