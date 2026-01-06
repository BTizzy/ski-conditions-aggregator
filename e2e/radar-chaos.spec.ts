import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function setRangeValue(inputSelector: string, value: number, page: any) {
  const input = page.locator(inputSelector);
  await input.waitFor({ timeout: 5000 });
  const v = value.toString();
  await input.evaluate((el, val) => {
    (el as HTMLInputElement).value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, v);
}

test('radar chaos interactions survive rapid user input', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (err) => pageErrors.push(err));

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  await page.waitForSelector('[data-testid="leaflet-map-container"]', { timeout: 15000 });
  const playButton = page.getByTestId('radar-play-pause');
  await playButton.waitFor({ timeout: 15000 });
  await page.waitForSelector('[data-testid="radar-ready"]', { timeout: 20000 });
  await page.waitForSelector('[data-testid^="radar-canvas-"]', { timeout: 20000, state: 'attached' });

  const canvasDebug = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[data-testid^="radar-canvas-"]')) as HTMLCanvasElement[];
    return nodes.map((n) => {
      const rect = n.getBoundingClientRect();
      const style = getComputedStyle(n);
      return {
        id: n.dataset.testid,
        width: rect.width,
        height: rect.height,
        display: style.display,
        opacity: style.opacity,
        visibility: style.visibility,
      };
    });
  });
  console.log('Canvas debug:', canvasDebug);

  const actions = [
    async () => playButton.click(),
    async () => page.getByRole('button', { name: /Prev/ }).click(),
  async () => page.getByRole('button', { name: 'Next ▶︎' }).click(),
    async () => page.getByRole('button', { name: /Refresh/ }).click(),
    async () => page.getByRole('button', { name: /Start/ }).click(),
    async () => page.getByRole('button', { name: /End/ }).click(),
    async () => page.getByRole('button', { name: /Highlight/ }).click(),
    async () => setRangeValue('#radar-opacity', Number(Math.random().toFixed(2)), page),
    async () => setRangeValue('#radar-speed', (200 + Math.random() * 1400) | 0, page),
  ];

  for (let i = 0; i < 12; i++) {
    const fn = actions[Math.floor(Math.random() * actions.length)];
    await fn();
    await page.waitForTimeout(150);
  }

  const canvases = page.locator('[data-testid^="radar-canvas-"]');
  await canvases.first().waitFor({ timeout: 5000 });
  const canvasCount = await canvases.count();
  expect(canvasCount).toBeGreaterThan(0);

  expect(pageErrors, 'page errors during chaos run').toHaveLength(0);
});
