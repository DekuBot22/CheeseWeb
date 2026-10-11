// Genera los íconos PNG de la app instalable a partir de los SVG de scripts/icons/.
// Uso (a mano, solo cuando cambie el diseño):  node scripts/generate-icons.mjs
// Los PNG resultantes se suben al repositorio: el build no depende de `sharp`.
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "icons");

const normal = await readFile(join(root, "scripts", "icons", "cuaderno.svg"));
const maskable = await readFile(join(root, "scripts", "icons", "cuaderno-maskable.svg"));
// A 32 px los renglones se funden: el favicon usa una versión simplificada y más grande.
const favicon = await readFile(join(root, "scripts", "icons", "cuaderno-favicon.svg"));

const targets = [
  { file: "icon-192.png", svg: normal, size: 192 },
  { file: "icon-512.png", svg: normal, size: 512 },
  { file: "icon-maskable-512.png", svg: maskable, size: 512 },
  // iOS no admite transparencia: el SVG ya trae fondo a sangre.
  { file: "apple-touch-icon.png", svg: normal, size: 180 },
  { file: "favicon-32.png", svg: favicon, size: 32 },
];

await mkdir(out, { recursive: true });
for (const { file, svg, size } of targets) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(join(out, file));
  console.log(`✓ public/icons/${file} (${size}×${size})`);
}
