// HF1 – Toolshop teszteset-készlet (TC01–TC08) végrehajtása valódi Chrome-ban.
// Referencia app: https://practicesoftwaretesting.com  (Practice Software Testing – Toolshop v5.0)
const { test, expect } = require('@playwright/test');

// --- Felderített, valós selectorok ---
const SEL = {
  search: '[data-test="search-query"]',
  searchSubmit: '[data-test="search-submit"]',
  searchReset: '[data-test="search-reset"]',
  sort: '[data-test="sort"]',
  card: 'a[data-test^="product-"]',
  name: '[data-test="product-name"]',
  price: '[data-test="product-price"]',
  noResults: '[data-test="no-results"]',
  // kategória / márka checkboxok (data-test ULID, felderítésből)
  catHammer: '[data-test="category-01KWD1WG5HYTY43YT7WQA7FSBP"]',
  catPliers: '[data-test="category-01KWD1WG5JH2MT6FWGBXVD0NWF"]',
  catDrill: '[data-test="category-01KWD1WG5JH2MT6FWGBXVD0NWN"]',
  brandForgeFlex: '[data-test="brand-01KWD1WFTKXEJS1K5TRKNZ7FFZ"]',
};

// Egy /products(/search) GET válasz bevárása + a teljes találatszám (total) kiolvasása
async function actGetTotal(page, fn) {
  const respP = page
    .waitForResponse(
      (r) => /\/products(\/search)?(\?|$)/.test(r.url()) && r.request().method() === 'GET',
      { timeout: 25000 }
    )
    .catch(() => null);
  await fn();
  const resp = await respP;
  let total = null;
  if (resp) {
    try {
      const j = await resp.json();
      total = j?.total ?? j?.meta?.total ?? null;
    } catch (_) {}
  }
  await page.waitForTimeout(600); // a DOM frissülésére
  return total;
}

async function gotoHome(page) {
  const respP = page
    .waitForResponse(
      (r) => /\/products(\?|$)/.test(r.url()) && r.request().method() === 'GET',
      { timeout: 30000 }
    )
    .catch(() => null);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(SEL.card, { timeout: 30000 });
  const resp = await respP;
  let total = null;
  if (resp) {
    try { const j = await resp.json(); total = j?.total ?? j?.meta?.total ?? null; } catch (_) {}
  }
  await page.waitForTimeout(400);
  return total;
}

const names = (page) => page.locator(SEL.name).allTextContents().then((a) => a.map((s) => s.trim()).filter(Boolean));
const prices = (page) => page.locator(SEL.price).allTextContents().then((a) => a.map((s) => parseFloat(s.replace(/[^0-9.]/g, ''))).filter((n) => !isNaN(n)));
const cardCount = (page) => page.locator(SEL.card).count();
const shot = (page, file) => page.screenshot({ path: `screenshots/${file}`, fullPage: true });

// ───────────────────────── TC01 ─────────────────────────
test('TC01 [happy_path] Keresés termék névre ("Pliers")', async ({ page }) => {
  await gotoHome(page);
  const total = await actGetTotal(page, async () => {
    await page.fill(SEL.search, 'Pliers');
    await page.click(SEL.searchSubmit);
  });
  const found = await names(page);
  console.log(`TC01 – találatok (${found.length} db, total=${total}):`, found.join(' | '));
  await shot(page, 'TC01_pliers.png');

  expect(found.length, 'legyen legalább 1 találat').toBeGreaterThan(0);
  for (const n of found) {
    expect(n.toLowerCase(), `"${n}" tartalmazza a keresett szót`).toContain('pliers');
  }
});

// ───────────────────────── TC02 ─────────────────────────
test('TC02 [happy_path] Szűrés kategóriára (Hammer)', async ({ page }) => {
  const total = await gotoHome(page);
  const hammerTotal = await actGetTotal(page, async () => {
    await page.locator(SEL.catHammer).check({ force: true });
  });
  const found = await names(page);
  console.log(`TC02 – Hammer kategória total=${hammerTotal} (teljes katalógus=${total}); nevek:`, found.join(' | '));
  await shot(page, 'TC02_hammer.png');

  expect(hammerTotal, 'a Hammer szűrő szűkít a teljes katalógushoz képest').toBeLessThan(total);
  expect(hammerTotal, 'van legalább 1 találat').toBeGreaterThan(0);
});

// ───────────────────────── TC03 ─────────────────────────
test('TC03 [happy_path] Ár szerinti rendezés növekvő (Price Low - High)', async ({ page }) => {
  await gotoHome(page);
  await actGetTotal(page, async () => {
    await page.selectOption(SEL.sort, 'price,asc');
  });
  const p = await prices(page);
  console.log('TC03 – árak (növekvő):', p.join(', '));
  await shot(page, 'TC03_price_asc.png');

  expect(p.length).toBeGreaterThan(1);
  const sorted = [...p].sort((a, b) => a - b);
  expect(p, 'az árak nem csökkenő sorrendben vannak').toEqual(sorted);
});

// ───────────────────────── TC04 ─────────────────────────
test('TC04 [happy_path] Ár szerinti rendezés csökkenő (Price High - Low)', async ({ page }) => {
  await gotoHome(page);
  await actGetTotal(page, async () => {
    await page.selectOption(SEL.sort, 'price,desc');
  });
  const p = await prices(page);
  console.log('TC04 – árak (csökkenő):', p.join(', '));
  await shot(page, 'TC04_price_desc.png');

  expect(p.length).toBeGreaterThan(1);
  const sorted = [...p].sort((a, b) => b - a);
  expect(p, 'az árak nem növekvő sorrendben vannak').toEqual(sorted);
});

// ───────────────────────── TC05 ─────────────────────────
test('TC05 [edge_case] Kategória ÉS márka együtt (AND): Pliers + ForgeFlex Tools', async ({ page }) => {
  const total = await gotoHome(page);
  const pliersTotal = await actGetTotal(page, async () => {
    await page.locator(SEL.catPliers).check({ force: true });
  });
  const bothTotal = await actGetTotal(page, async () => {
    await page.locator(SEL.brandForgeFlex).check({ force: true });
  });
  const found = await names(page);
  console.log(`TC05 – teljes=${total}, csak Pliers=${pliersTotal}, Pliers ÉS ForgeFlex=${bothTotal}; nevek:`, found.join(' | '));
  await shot(page, 'TC05_pliers_forgeflex.png');

  expect(pliersTotal, 'a kategóriaszűrő szűkít').toBeLessThan(total);
  expect(bothTotal, 'a két szűrő együtt (AND) nem ad több találatot, mint a kategória önmagában').toBeLessThanOrEqual(pliersTotal);
  expect(bothTotal, 'van legalább 1 közös találat').toBeGreaterThan(0);
});

// ───────────────────────── TC06 ─────────────────────────
test('TC06 [edge_case] Szűrők törlése és a lista visszaállítása', async ({ page }) => {
  const total = await gotoHome(page);
  const filtered = await actGetTotal(page, async () => {
    await page.locator(SEL.catDrill).check({ force: true });
  });
  console.log(`TC06 – szűrés után (Drill) total=${filtered}, teljes=${total}`);
  expect(filtered, 'a Drill szűrő leszűkíti a listát').toBeLessThan(total);

  const restored = await actGetTotal(page, async () => {
    await page.locator(SEL.catDrill).uncheck({ force: true });
  });
  console.log(`TC06 – szűrő törlése után total=${restored}`);
  await shot(page, 'TC06_reset.png');
  expect(restored, 'a szűrő törlése után visszaáll a teljes lista').toBe(total);
});

// ───────────────────────── TC07 ─────────────────────────
test('TC07 [boundary] Keresés kis-/nagybetűvel és felesleges szóközökkel', async ({ page }) => {
  await gotoHome(page);

  await actGetTotal(page, async () => { await page.fill(SEL.search, 'pliers'); await page.click(SEL.searchSubmit); });
  const lower = (await names(page)).sort();
  console.log('TC07 – "pliers":', lower.join(' | '));

  await actGetTotal(page, async () => { await page.fill(SEL.search, 'PLIERS'); await page.click(SEL.searchSubmit); });
  const upper = (await names(page)).sort();
  console.log('TC07 – "PLIERS":', upper.join(' | '));

  await actGetTotal(page, async () => { await page.fill(SEL.search, '  Pliers  '); await page.click(SEL.searchSubmit); });
  const padded = (await names(page)).sort();
  console.log('TC07 – "  Pliers  ":', padded.join(' | '));
  await shot(page, 'TC07_case_space.png');

  expect(lower.length, 'a kisbetűs keresés ad találatot').toBeGreaterThan(0);
  // Fő (boundary) elvárás: a keresés kis-/nagybetűre érzéketlen
  expect(upper, 'a kis- és nagybetűs keresés ugyanazt adja (case-insensitive)').toEqual(lower);
  // Másodlagos: vezető/záró szóközök kezelése (trim) – ha eltér, az külön megfigyelés
  expect.soft(padded, 'a vezető/záró szóközöket figyelmen kívül hagyja (trim)').toEqual(lower);
});

// ───────────────────────── TC08 ─────────────────────────
test('TC08 [negative] Keresés nem létező névre → nincs találat', async ({ page }) => {
  await gotoHome(page);
  await actGetTotal(page, async () => {
    await page.fill(SEL.search, 'qwertyxyz123');
    await page.click(SEL.searchSubmit);
  });
  const count = await cardCount(page);
  const msg = page.locator(SEL.noResults);
  console.log(`TC08 – termékkártyák száma: ${count}; üzenet látszik: ${await msg.isVisible()}`);
  await shot(page, 'TC08_no_results.png');

  expect(count, 'egyetlen termékkártya sem jelenik meg').toBe(0);
  await expect(msg, 'megjelenik a "nincs találat" üzenet').toBeVisible();
  await expect(msg).toContainText('There are no products found');
});
