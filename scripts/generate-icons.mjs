// Genera los íconos PWA (gota ámbar sobre verde bosque). Uso: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const FOREST = "#1F3D2B";
const AMBER = "#E8A33D";
const CREAM = "#FAF6EE";
const DROP = "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z";
const SHINE = "M8.6 15.2a3.4 3.4 0 0 0 3.4 3.4";

function svg({ size = 512, radius = 112, scale = 15, bg = FOREST }) {
  const cx = size / 2;
  const cy = size / 2;
  const tx = cx - 12 * scale;
  const ty = cy - 12.25 * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">
    <path d="${DROP}" fill="${AMBER}"/>
    <path d="${SHINE}" fill="none" stroke="${CREAM}" stroke-width="1.3" stroke-linecap="round" opacity="0.9"/>
  </g>
</svg>`;
}

mkdirSync("public/icons", { recursive: true });

const regular = svg({});
const maskable = svg({ radius: 0, scale: 11 });
const apple = svg({ radius: 0, scale: 13 });

await sharp(Buffer.from(regular)).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(Buffer.from(regular)).resize(512, 512).png().toFile("public/icons/icon-512.png");
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile("public/icons/maskable-512.png");
await sharp(Buffer.from(maskable)).resize(192, 192).png().toFile("public/icons/maskable-192.png");
await sharp(Buffer.from(apple)).resize(180, 180).png().toFile("app/apple-icon.png");
writeFileSync("app/icon.svg", svg({ size: 64, radius: 14, scale: 2.1 }));
console.log("Íconos generados.");
