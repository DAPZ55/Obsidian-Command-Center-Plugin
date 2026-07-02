import { build, context } from 'esbuild';
import { promises as fs, watch as fsWatch } from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const isDev = process.argv.includes('--mode=dev');
const isBuild = process.argv.includes('--mode=build');

if (!isDev && !isBuild) {
  console.log('Usage: node esbuild.config.mjs --mode=[dev|build]');
  process.exit(1);
}

const ROOT = process.cwd();

const FONT_FACES = [
  { family: 'Hanken Grotesk', style: 'normal', weight: '300 800', file: 'hanken-grotesk-normal.woff2' },
  { family: 'Hanken Grotesk', style: 'italic', weight: '400', file: 'hanken-grotesk-italic.woff2' },
  { family: 'Instrument Serif', style: 'normal', weight: '400', file: 'instrument-serif-normal.woff2' },
  { family: 'Instrument Serif', style: 'italic', weight: '400', file: 'instrument-serif-italic.woff2' },
  { family: 'Space Mono', style: 'normal', weight: '400', file: 'space-mono-normal-400.woff2' },
  { family: 'Space Mono', style: 'normal', weight: '700', file: 'space-mono-normal-700.woff2' },
  { family: 'Space Mono', style: 'italic', weight: '400', file: 'space-mono-italic-400.woff2' },
];

async function fontFacesCSS() {
  const blocks = await Promise.all(
    FONT_FACES.map(async (f) => {
      const bytes = await fs.readFile(path.join(ROOT, 'fonts', f.file));
      return `@font-face {
  font-family: '${f.family}';
  font-style: ${f.style};
  font-weight: ${f.weight};
  font-display: swap;
  src: url(data:font/woff2;base64,${bytes.toString('base64')}) format('woff2');
}`;
    })
  );
  return blocks.join('\n\n');
}

async function buildCSS() {
  const source = await fs.readFile(path.join(ROOT, 'src', 'styles.css'), 'utf8');
  const withFonts = source.replace('/* FONT_FACES_INJECTED_BY_BUILD */', await fontFacesCSS());

  const result = await postcss([tailwindcss, autoprefixer]).process(withFonts, {
    from: path.join(ROOT, 'src', 'styles.css'),
    to: path.join(ROOT, 'styles.css'),
  });

  await fs.writeFile(path.join(ROOT, 'styles.css'), result.css);
  console.log(`Built styles.css (${result.css.length} bytes)`);
}

const jsOptions = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  target: 'es2020',
  outfile: 'main.js',
  external: ['obsidian', 'electron'],
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
  },
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
  define: {
    'process.env.NODE_ENV': isBuild ? '"production"' : '"development"',
  },
  minify: isBuild,
  sourcemap: isDev,
  logLevel: 'info',
};

async function main() {
  await buildCSS();

  if (isBuild) {
    await build(jsOptions);
    console.log('Production build complete.');
    return;
  }

  const ctx = await context(jsOptions);
  await ctx.watch();

  fsWatch(path.join(ROOT, 'src', 'styles.css'), async () => {
    try {
      await buildCSS();
    } catch (err) {
      console.error('CSS rebuild failed:', err);
    }
  });
  fsWatch(path.join(ROOT, 'tailwind.config.js'), async () => {
    try {
      await buildCSS();
    } catch (err) {
      console.error('CSS rebuild failed:', err);
    }
  });

  console.log('Watching for changes... (main.js via esbuild, styles.css on file change)');
}

main().catch((error) => {
  console.error('Build error:', error);
  process.exit(1);
});
