// Build-Schritt für Vercel: kopiert index.html nach public/ und erzeugt das Homescreen-Icon (PNG) ohne Abhängigkeiten.
const fs = require("fs"), zlib = require("zlib");
fs.mkdirSync("public", { recursive: true });
// index.html liegt in Teilen unter src/ (Upload-Größenlimit) und wird hier zusammengesetzt
const parts = fs.readdirSync("src").filter(f => /^index\.part\d+\.html$/.test(f)).sort();
fs.writeFileSync("public/index.html", Buffer.concat(parts.map(f => fs.readFileSync("src/" + f))));

const S = 180, SS = 4; // Größe, Supersampling
const bg = [14, 19, 29], orange = [247, 147, 26], white = [255, 255, 255];
// Form des ₿: Stamm, zwei Bögen, Querbalken, Striche oben/unten
function inRing(x, y, cx, cy, ro, ri) { const d = Math.hypot(x - cx, y - cy); return x >= cx && d <= ro && d >= ri; }
function isGlyph(x, y) {
  if (x >= 66 && x <= 80 && y >= 50 && y <= 130) return true;          // Stamm
  if (x >= 66 && x <= 93 && ((y >= 50 && y <= 62) || (y >= 84 && y <= 96) || (y >= 118 && y <= 130))) return true; // Balken
  if (inRing(x, y, 90, 73, 23, 11)) return true;                        // oberer Bogen
  if (inRing(x, y, 92, 107, 23, 11)) return true;                       // unterer Bogen
  if (((x >= 72 && x <= 80) || (x >= 88 && x <= 96)) && ((y >= 38 && y <= 50) || (y >= 130 && y <= 142))) return true; // Striche
  return false;
}
function color(x, y) {
  if (Math.hypot(x - 90, y - 90) > 72) return bg;
  return isGlyph(x, y) ? white : orange;
}
const raw = Buffer.alloc(S * (S * 3 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 3 + 1)] = 0;
  for (let x = 0; x < S; x++) {
    let r = 0, g = 0, b = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const c = color(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS); r += c[0]; g += c[1]; b += c[2];
    }
    const o = y * (S * 3 + 1) + 1 + x * 3, n = SS * SS;
    raw[o] = Math.round(r / n); raw[o + 1] = Math.round(g / n); raw[o + 2] = Math.round(b / n);
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = buf => { let c = 0xffffffff; for (const byte of buf) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
fs.writeFileSync("public/apple-touch-icon.png", png);
console.log("Build fertig: public/index.html, public/apple-touch-icon.png (" + png.length + " Bytes)");
