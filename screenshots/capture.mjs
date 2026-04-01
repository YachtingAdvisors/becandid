import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = [
  'screenshot-1-dashboard.html',
  'screenshot-2-focus-board.html',
  'screenshot-3-rivals.html',
  'screenshot-4-journal.html',
  'screenshot-5-partner.html',
];

const WIDTH = 1284;
const HEIGHT = 2778;

async function capture() {
  const browser = await puppeteer.launch({ headless: true });

  for (const file of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    const filePath = path.join(__dirname, file);
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1000));

    const outName = file.replace('.html', '.png');
    await page.screenshot({
      path: path.join(__dirname, outName),
      type: 'png',
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
    console.log(`Captured: ${outName} (${WIDTH}x${HEIGHT})`);
    await page.close();
  }

  await browser.close();
  console.log('\nAll screenshots saved to screenshots/ folder.');
}

capture().catch(console.error);
