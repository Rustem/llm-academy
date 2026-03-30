# Useful Development Commands

## Running the App

```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev

# Both (background)
cd backend && uvicorn app.main:app --reload &
cd frontend && npm run dev &
```

## API Testing

```bash
# List all courses
curl -s http://localhost:8000/api/courses | python3 -m json.tool

# Course exercises
curl -s http://localhost:8000/api/courses/general/exercises | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'{len(d)} exercises')"

# Single exercise with materials
curl -s http://localhost:8000/api/courses/medical/exercises/1 | python3 -m json.tool

# Templates
curl -s http://localhost:8000/api/templates?course=medical | python3 -m json.tool

# Health check
curl -s http://localhost:8000/api/health
```

## Playwright Screenshots & Testing

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run smoke tests
npx playwright test e2e/smoke.spec.mjs --reporter=line

# Take screenshots programmatically (Node.js)
node -e "
const { chromium, devices } = require('playwright');
(async () => {
  const browser = await chromium.launch();

  // Desktop
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:5174/courses');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshot.png', fullPage: true });

  // Mobile (iPhone)
  const iPhone = devices['iPhone 13'];
  const mobile = await browser.newPage({ ...iPhone });
  await mobile.goto('http://localhost:5174/courses');
  await mobile.waitForTimeout(2000);
  await mobile.screenshot({ path: 'e2e/mobile.png', fullPage: true });

  await browser.close();
})();
"

# Debug page content (useful when screenshots appear blank)
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  await page.goto('http://localhost:5174/course/general');
  await page.waitForTimeout(3000);
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('TEXT:', text);
  const divs = await page.evaluate(() => document.querySelectorAll('div').length);
  console.log('DIVS:', divs);
  await browser.close();
})();
"

# Test i18n language switching
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/courses');
  await page.waitForTimeout(2000);

  // Switch to Russian
  await page.evaluate(() => localStorage.setItem('llm-academy-lang', 'ru'));
  await page.reload();
  await page.waitForTimeout(2000);
  console.log(await page.evaluate(() => document.body.innerText.substring(0, 200)));

  await browser.close();
})();
"
```

## Validation

```bash
# Validate all course JSON files
cd backend && python3 -c "
import json
for name in ['general', 'medical', 'education', 'legal', 'psychotherapy']:
    with open(f'data/courses/{name}.json') as f:
        data = json.load(f)
    ex = data['exercises']
    mat = data.get('materials', {})
    print(f'{name}: {len(ex)} exercises, {len(mat)} materials')
"

# Test backend with FastAPI TestClient
cd backend && python3 -c "
from app.main import app
from fastapi.testclient import TestClient
client = TestClient(app)
print('Courses:', client.get('/api/courses').status_code)
print('Exercises:', len(client.get('/api/courses/general/exercises').json()))
print('Templates:', len(client.get('/api/templates').json()))
"

# Frontend build check
cd frontend && npm run build
```

## Database

```bash
# Reset database (delete and restart)
rm backend/llm_academy.db
cd backend && uvicorn app.main:app --reload  # tables auto-created

# Check database schema
cd backend && python3 -c "
from sqlalchemy import inspect
from app.database import engine
insp = inspect(engine)
for table in insp.get_table_names():
    cols = [c['name'] for c in insp.get_columns(table)]
    print(f'{table}: {cols}')
"
```
