// Takes the screenshots in docs/screenshots/ by driving the app in an
// iPhone-sized headless browser.
//
//   DEMO_EMAIL=alex@example.com DEMO_PASSWORD=... DEMO_SKIP_ROUTINES=1 npm run seed-demo
//   npm run build && npm start                       # in another terminal
//   DEMO_EMAIL=alex@example.com DEMO_PASSWORD=... npm run screenshots
//
// Use a freshly seeded demo account without routines: the script shows the
// empty Routines screen, creates Push / Pull / Legs from the template, and
// logs two sets for today through the UI (so a routine shows as partly done). Needs Chromium once:
// `npx playwright install chromium`. BASE_URL defaults to localhost:3000.

import { mkdirSync } from "node:fs";

import { chromium, devices, type Page } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.env.DEMO_EMAIL || "demo@example.com";
const PASSWORD = process.env.DEMO_PASSWORD;
const OUT = "docs/screenshots";

if (!PASSWORD) {
  console.error("Set DEMO_PASSWORD (and DEMO_EMAIL if not demo@example.com).");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function newPage(colorScheme: "light" | "dark") {
  const context = await browser.newContext({
    ...devices["iPhone 15"],
    deviceScaleFactor: 2,
    colorScheme,
  });
  return context.newPage();
}

async function shot(page: Page, name: string) {
  // Let transitions and client-side fills (like today's date) settle.
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`  ${name}.png`);
}

async function signIn(page: Page) {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.fill("input[name=email]", EMAIL);
  await page.fill("input[name=password]", PASSWORD!);
  await page.click("form button:text-is('Sign in')");
  await page.waitForURL(`${BASE_URL}/routines`);
}

async function openRoutine(page: Page, name: string) {
  await page.goto(`${BASE_URL}/routines`);
  await page.locator("main a", { hasText: name }).click();
  await page.waitForURL(/\/routines\/\d+$/);
}

async function openExercise(page: Page, tab: "log" | "stats", name: string) {
  await page.goto(`${BASE_URL}/${tab}`);
  await page.fill("input[type=search]", name);
  await page.locator("main li a", { hasText: new RegExp(`^${name}$`) }).click();
  await page.waitForURL(new RegExp(`/${tab}/\\d+$`));
}

// Logs the pre-filled values (optionally bumping the weight) from a routine.
async function logFromRoutine(page: Page, routine: string, exercise: string, bump = 0) {
  await openRoutine(page, routine);
  await page.locator("main li a", { hasText: exercise }).click();
  await page.waitForURL(/\/routines\/\d+\/\d+$/);
  for (let i = 0; i < bump; i++) await page.click("[aria-label='Increase Weight (lb)']");
  const before = await page.locator("section li").count();
  await page.click("main form button:has-text('Save')");
  await page.waitForFunction((n) => document.querySelectorAll("section li").length > n, before);
}

console.log(`Screenshots of ${BASE_URL} as ${EMAIL}:`);

const page = await newPage("light");

await page.goto(`${BASE_URL}/sign-in`);
await shot(page, "sign-in");

await signIn(page);
await shot(page, "routines-empty");

await page.locator("main button", { hasText: "Push / Pull / Legs" }).click();
await page.locator("main a", { hasText: "Legs" }).waitFor();

await page.goto(`${BASE_URL}/routines/new`);
await shot(page, "new-routine");

await logFromRoutine(page, "Push", "Bench Press", 1);
await logFromRoutine(page, "Push", "Incline Dumbbell Press");

await page.goto(`${BASE_URL}/routines`);
await shot(page, "routines");

await openRoutine(page, "Push");
await shot(page, "routine");

await page.locator("main li a", { hasText: "Overhead Press" }).click();
await page.waitForURL(/\/routines\/\d+\/\d+$/);
await shot(page, "log-exercise");

await page.locator("section li button").first().click();
await page.locator("section form").waitFor();
await page.locator("section form").evaluate((form) => form.scrollIntoView({ block: "center" }));
await shot(page, "edit-entry");

await openRoutine(page, "Push");
await page.click("header >> text=Edit");
await page.waitForURL(/\/edit$/);
await shot(page, "edit-routine");

await page.goto(`${BASE_URL}/log`);
await shot(page, "exercises");

await page.fill("input[type=search]", "cable pullover");
await page.click("text=+ Add");
await shot(page, "add-exercise");

await openExercise(page, "stats", "Bench Press");
await page.click("button:text-is('All')");
await shot(page, "stats");

await page.click("button:text-is('1Y')");
const chart = page.locator("svg[role=img]").first();
const box = (await chart.boundingBox())!;
await chart.click({ position: { x: box.width * 0.55, y: box.height / 2 } });
await shot(page, "stats-day");

await page.context().close();

const dark = await newPage("dark");
await signIn(dark);
await openRoutine(dark, "Push");
await shot(dark, "routine-dark");
// The last 6 months of curls are a decline, to show a downward trend.
await openExercise(dark, "stats", "Barbell Curl");
await dark.click("button:text-is('6M')");
await shot(dark, "stats-dark");
await dark.context().close();

await browser.close();
