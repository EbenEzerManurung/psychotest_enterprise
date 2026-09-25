// Generate PNG solid color tanpa dependency eksternal
import fs from 'node:fs';
import zlib from 'node:zlib';

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData) >>> 0, 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function makePNG(size, rgb) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const rowSize = size * 3 + 1;
  const rawData = Buffer.alloc(rowSize * size);
  for (let y = 0; y < size; y++) {
    rawData[y * rowSize] = 0;
    for (let x = 0; x < size; x++) {
      const offset = y * rowSize + 1 + x * 3;
      rawData[offset] = rgb[0];
      rawData[offset + 1] = rgb[1];
      rawData[offset + 2] = rgb[2];
    }
  }
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Hijau tua (#15803d) = RGB(21, 128, 61)
const GREEN = [21, 128, 61];

fs.mkdirSync('static/icons', { recursive: true });
fs.writeFileSync('static/icons/icon-192.png', makePNG(192, GREEN));
fs.writeFileSync('static/icons/icon-512.png', makePNG(512, GREEN));
fs.writeFileSync('static/favicon.png', makePNG(32, GREEN));

console.log('✅ Ikon berhasil dibuat!');
