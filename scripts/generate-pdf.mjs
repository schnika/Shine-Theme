#!/usr/bin/env node
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, extname, basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);

let inputArg;
let outputArg;
const positional = [];

for (let index = 0; index < args.length; index += 1) {
  const value = args[index];

  if (value === '--input' || value === '-i') {
    inputArg = args[index + 1];
    index += 1;
    continue;
  }

  if (value.startsWith('--input=')) {
    inputArg = value.slice('--input='.length);
    continue;
  }

  if (value === '--output' || value === '-o') {
    outputArg = args[index + 1];
    index += 1;
    continue;
  }

  if (value.startsWith('--output=')) {
    outputArg = value.slice('--output='.length);
    continue;
  }

  if (value.startsWith('-')) {
    console.warn(`Ignoring unknown option: ${value}`);
    continue;
  }

  positional.push(value);
}

if (!inputArg && positional.length > 0) {
  [inputArg] = positional;
}

if (!outputArg && positional.length > 1) {
  outputArg = positional[1];
}

async function resolveDefaultInput() {
  try {
    const raw = await readFile(new URL('../build.config.json', import.meta.url), 'utf8');
    const config = JSON.parse(raw);
    if (!config?.locales || !Array.isArray(config.locales)) {
      return 'index.html';
    }

    const defaultLocale = config.defaultLocale;
    const fallback = config.locales[0];
    const matching = config.locales.find((entry) => entry.locale === defaultLocale);
    return (matching ?? fallback)?.output ?? 'index.html';
  } catch (error) {
    const reason = error instanceof Error ? error.message : error;
    console.warn('Could not determine default locale from build.config.json. Falling back to index.html.', reason);
    return 'index.html';
  }
}

const inputRelative = inputArg ?? await resolveDefaultInput();
const defaultOutputName = inputArg
  ? `${basename(inputRelative, extname(inputRelative)) || 'resume'}.pdf`
  : 'resume.pdf';
const outputRelative = outputArg ?? defaultOutputName;

const inputPath = resolve(process.cwd(), inputRelative);
const outputPath = resolve(process.cwd(), outputRelative);

await mkdir(dirname(outputPath), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });

try {
  const url = pathToFileURL(inputPath).href;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'screen' });
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(300);

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  console.log(`Saved resume PDF to ${outputPath}`);
} catch (error) {
  console.error('Failed to generate resume PDF.', error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
