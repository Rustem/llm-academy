import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';
const EMAIL = 'r.kamun@gmail.com';
const PASSWORD = '123456';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button:has-text("Log in")');
  await page.waitForURL(/\/(courses|onboarding)/, { timeout: 10000 });

  if (page.url().includes('onboarding')) {
    await page.click('button >> nth=0');
    await page.waitForURL('**/course/**', { timeout: 10000 });
  }
}

test('login and navigate to courses', async ({ page }) => {
  await login(page);

  await page.goto(`${BASE}/courses`);
  await expect(page.locator('body')).toContainText(/Courses|Choose your path/i);
  await expect(page.locator('body')).toContainText(/General Professional/i);
  console.log('Courses page loaded successfully');
  await page.screenshot({ path: 'e2e/dashboard.png', fullPage: true });
});

test('open general course dashboard', async ({ page }) => {
  await login(page);

  await page.goto(`${BASE}/course/general`);
  await page.waitForTimeout(2000);

  await expect(page.locator('body')).toContainText(/Module|Exercise/i);
  console.log('Course dashboard loaded successfully');
});

test('open first exercise in general course', async ({ page }) => {
  await login(page);

  await page.goto(`${BASE}/course/general/exercise/1`);
  await page.waitForTimeout(2000);

  await expect(page.locator('body')).toContainText(/prompt|exercise/i);
  console.log('Exercise page loaded successfully');
  await page.screenshot({ path: 'e2e/exercise.png', fullPage: true });
});

test('general course accessible without login', async ({ page }) => {
  await page.goto(`${BASE}/course/general`);
  await page.waitForTimeout(2000);

  await expect(page.locator('body')).toContainText(/Module|General Professional/i);
  console.log('General course accessible without auth');
});
