import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const inputs = ['index.html', 'src/spatial-review.js', 'src/navigation-review.js', 'package-lock.json'];
const hash = createHash('sha256');
for (const path of inputs) hash.update(await readFile(path));
const buildId = `kage-sr-0.4.0-${hash.digest('hex').slice(0, 16)}`;
await build({
  entryPoints: ['src/spatial-review.js'],
  outfile: 'assets/kage-runtime.js',
  bundle: true,
  format: 'iife',
  minify: true,
  target: ['es2020'],
  legalComments: 'eof',
  define: { __KAGE_BUILD_ID__: JSON.stringify(buildId) },
});
console.log(`Built ${buildId}`);
