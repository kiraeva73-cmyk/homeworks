// Felderítő szkript: a practicesoftwaretesting.com valós selectorjainak kinyerése
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const out = {};
  try {
    await page.goto('https://practicesoftwaretesting.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Várjunk a termékkártyák megjelenésére
    await page.waitForSelector('[data-test^="product-"]', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);

    out.title = await page.title();
    out.url = page.url();

    out.probe = await page.evaluate(() => {
      const q = (sel) => !!document.querySelector(sel);
      const txt = (sel) => { const e = document.querySelector(sel); return e ? e.textContent.trim().slice(0, 80) : null; };

      // Termékkártyák
      const productEls = Array.from(document.querySelectorAll('[data-test^="product-"]'));
      const firstCard = productEls[0];
      let cardInfo = null;
      if (firstCard) {
        cardInfo = {
          dataTest: firstCard.getAttribute('data-test'),
          tag: firstCard.tagName,
          hasProductName: !!firstCard.querySelector('[data-test="product-name"]'),
          hasProductPrice: !!firstCard.querySelector('[data-test="product-price"]'),
          nameText: firstCard.querySelector('[data-test="product-name"]')?.textContent?.trim() || null,
          priceText: firstCard.querySelector('[data-test="product-price"]')?.textContent?.trim() || null,
          outer: firstCard.outerHTML.slice(0, 400),
        };
      }

      // Sort select
      const sortSel = document.querySelector('[data-test="sort"]');
      const sortOptions = sortSel ? Array.from(sortSel.querySelectorAll('option')).map(o => ({ value: o.value, text: o.textContent.trim() })) : null;

      // Checkboxok (kategória / márka szűrők)
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).map(cb => {
        let labelText = null;
        if (cb.id) { const l = document.querySelector(`label[for="${cb.id}"]`); if (l) labelText = l.textContent.trim(); }
        if (!labelText) { const l = cb.closest('label'); if (l) labelText = l.textContent.trim(); }
        if (!labelText && cb.parentElement) labelText = cb.parentElement.textContent.trim().slice(0, 40);
        return { dataTest: cb.getAttribute('data-test'), id: cb.id, label: labelText };
      });

      return {
        search_query: q('[data-test="search-query"]'),
        search_submit: q('[data-test="search-submit"]'),
        search_reset: q('[data-test="search-reset"]'),
        search_caption: txt('[data-test="search-caption"]'),
        sortExists: !!sortSel,
        sortOptions,
        productCount: productEls.length,
        cardInfo,
        checkboxCount: checkboxes.length,
        checkboxes,
        filtersHeading: txt('[data-test="filters"]') || (document.body.innerText.includes('Filters') ? 'has-Filters-text' : null),
      };
    });

    // Üres találat felderítése: keressünk nem létező termékre
    try {
      await page.fill('[data-test="search-query"]', 'qwertyxyz123');
      await page.click('[data-test="search-submit"]');
      await page.waitForTimeout(3000);
      out.emptyState = await page.evaluate(() => {
        const body = document.body.innerText;
        const noResult = document.querySelector('[data-test="no-results"]');
        return {
          hasNoResultsDataTest: !!noResult,
          noResultsText: noResult ? noResult.textContent.trim() : null,
          bodyHasNoProducts: body.includes('There are no products found'),
          productCountAfter: document.querySelectorAll('[data-test^="product-"]').length,
        };
      });
    } catch (e) { out.emptyStateError = String(e); }

  } catch (e) {
    out.error = String(e);
  } finally {
    const fs = require('fs');
    fs.writeFileSync('discovery.json', JSON.stringify(out, null, 2), 'utf8');
    console.log(JSON.stringify(out, null, 2));
    await browser.close();
  }
})();
