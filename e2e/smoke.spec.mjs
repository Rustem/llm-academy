import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';
const EMAIL = 'r.kamun@gmail.com';
const PASSWORD = '123456';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button:has-text("Log in")');
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });

  if (page.url().includes('onboarding')) {
    await page.click('button >> nth=0');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  }
}

test('login and navigate to dashboard', async ({ page }) => {
  await login(page);

  await expect(page.locator('body')).toContainText(/Module|Exercise|Dashboard/i);
  console.log('Dashboard loaded successfully');
  await page.screenshot({ path: 'e2e/dashboard.png', fullPage: true });
});

test('open first exercise', async ({ page }) => {
  await login(page);

  await page.goto(`${BASE}/exercise/1`);
  await page.waitForTimeout(2000);

  await expect(page.locator('body')).toContainText(/prompt|exercise/i);
  console.log('Exercise page loaded successfully');
  await page.screenshot({ path: 'e2e/exercise.png', fullPage: true });
});
