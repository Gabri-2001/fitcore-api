'use strict';
/**
 * Generates self-contained, 360px square anatomical icons from the original
 * second FitCore atlas. These files do not request the atlas at render time.
 * The illustrations remain raster WebP, embedded within a per-icon SVG frame.
 * Run: node scripts/build-centered-muscle-icons.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assetDir = path.resolve(__dirname, '../src/main/resources/static/fitcore-lab');
const atlasPath = path.join(assetDir, 'muscle-icons-premium-2.webp');
const specs = Object.freeze([
    {code:'QUADRICEPS', label:'Cuádriceps', filename:'muscle-icon-quadriceps.svg', col:1, row:0, padding:9},
    {code:'HAMSTRINGS', label:'Isquiotibiales', filename:'muscle-icon-hamstrings.svg', col:2, row:0, padding:9},
    {code:'GLUTES', label:'Glúteos', filename:'muscle-icon-glutes.svg', col:3, row:0, padding:9}
]);
function renderIcon(spec, sourceBase64) {
    const frame = 360 - spec.padding * 2;
    const cellX = spec.col * 192;
    const cellY = spec.row * 192;
    return `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">\n` +
        `  <title>${spec.label}</title>\n` +
        `  <defs><clipPath id="portrait-clip"><circle cx="180" cy="180" r="170"/></clipPath></defs>\n` +
        `  <g clip-path="url(#portrait-clip)">\n` +
        `    <svg x="${spec.padding}" y="${spec.padding}" width="${frame}" height="${frame}" viewBox="${cellX} ${cellY} 192 192">\n` +
        `      <image x="0" y="0" width="768" height="384" href="data:image/webp;base64,${sourceBase64}"/>\n` +
        `    </svg>\n` +
        `  </g>\n` +
        `</svg>\n`;
}
function build() {
    const sourceBase64 = fs.readFileSync(atlasPath).toString('base64');
    for (const spec of specs) {
        fs.writeFileSync(path.join(assetDir, spec.filename), renderIcon(spec, sourceBase64), 'utf8');
    }
}
if (require.main === module) build();
module.exports = {specs, renderIcon};
