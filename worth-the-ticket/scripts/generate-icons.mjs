/**
 * Generates PWA icons from the SVG source.
 * Run once during setup: node scripts/generate-icons.mjs
 * Requires: npm install -g sharp  OR  npx sharp-cli
 */
import { execSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "public/icons/icon.svg");
const out = join(root, "public/icons");

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}

console.log("Generating PWA icons from SVG...");

// Try sharp-cli first
const sharpOk =
  run(`npx sharp-cli -i "${src}" -o "${out}/apple-touch-icon.png" resize 180 180`) &&
  run(`npx sharp-cli -i "${src}" -o "${out}/icon-192.png" resize 192 192`) &&
  run(`npx sharp-cli -i "${src}" -o "${out}/icon-512.png" resize 512 512`);

if (!sharpOk) {
  // Fallback: try ImageMagick convert
  const magickOk =
    run(`convert -background none -resize 180x180 "${src}" "${out}/apple-touch-icon.png"`) &&
    run(`convert -background none -resize 192x192 "${src}" "${out}/icon-192.png"`) &&
    run(`convert -background none -resize 512x512 "${src}" "${out}/icon-512.png"`);

  if (!magickOk) {
    console.log(
      "\nCould not auto-generate icons. Options:\n" +
      "  1. Install sharp-cli: npm install -g sharp-cli\n" +
      "  2. Install ImageMagick: brew install imagemagick\n" +
      "  3. Manually place 180x180 PNG at public/icons/apple-touch-icon.png\n" +
      "\nThe app works without icons — this only affects the home screen thumbnail."
    );
    process.exit(0);
  }
}

console.log("Icons generated in public/icons/");
