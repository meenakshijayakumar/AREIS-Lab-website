const { chromium } = require('C:/Users/108139/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [];
  const base = 'http://localhost:3000';
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.collage-grid')?.getAnimations({ subtree: true }).some(a => a.animationName === 'collage-focus'));
    const motion = await page.locator('.collage-grid').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.animationName === 'collage-focus').map(a => ({ duration: a.effect.getTiming().duration, delay: a.effect.getTiming().delay, iterations: a.effect.getTiming().iterations })));
    assert(motion.length > 0 && motion.every(a => a.duration === 700 && a.delay <= 300 && a.iterations === 1));
    await page.waitForFunction(() => document.querySelectorAll('.collage-enter').length === 6 && document.querySelector('.collage-grid').getAnimations({ subtree: true }).every(a => a.playState === 'finished'));
    await page.waitForFunction(() => [...document.querySelectorAll('.hero-collage img')].every(img => img.complete && img.naturalWidth > 0));
    await page.locator('.collage-pollination').hover();
    await page.waitForFunction(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.collage-pollination img')).transform).a > 1.025);
    await page.locator('.collage-teleoperation').hover();
    assert.equal(await page.locator('.collage-teleoperation img').evaluate(el => getComputedStyle(el).transform), 'none');
    await page.mouse.move(20, 20);
    await page.waitForFunction(() => document.querySelector('.collage-grid').getAnimations({ subtree: true }).every(a => a.playState === 'finished'));
    await page.locator('.hero-collage').screenshot({ path: path.join(__dirname, 'collage-motion-desktop.png') });
    await page.locator('.premise-visual').scrollIntoViewIfNeeded();
    const premise = await page.locator('.premise-visual img').evaluate(el => ({ radius: getComputedStyle(el).borderRadius, position: getComputedStyle(el).objectPosition, src: el.getAttribute('src') }));
    assert.equal(premise.radius, '16px');
    assert.equal(premise.position, '100% 50%');
    await page.locator('.premise-visual').screenshot({ path: path.join(__dirname, 'premise-rounded.png'), style: '.site-header { visibility:hidden }' });
    for (const width of [820, 390, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(base, { waitUntil: 'networkidle' });
      const before = await page.locator('.collage-enter').count();
      const tiles = page.locator('.collage-grid figure');
      for (let index = 0; index < 6; index++) {
        await tiles.nth(index).scrollIntoViewIfNeeded();
        await page.waitForFunction(i => document.querySelectorAll('.collage-grid figure')[i].classList.contains('collage-enter'), index);
      }
      await page.waitForFunction(() => document.querySelector('.collage-grid').getAnimations({ subtree: true }).every(a => a.playState === 'finished'));
      assert.equal(await page.locator('.collage-enter').count(), 6);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('.hero').scrollIntoViewIfNeeded();
      await page.locator('.collage-grid').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('.collage-grid').evaluate(el => el.getAnimations({ subtree: true }).length), 0, 'Entrance must not replay on scroll');
      if (width === 390) await page.locator('.hero-collage').screenshot({ path: path.join(__dirname, 'collage-motion-mobile.png'), style: '.site-header { visibility:hidden }' });
      console.log(JSON.stringify({ width, initiallyRevealed: before, afterScroll: 6, overflow: false, replays: 0 }));
    }
    await context.close();
    for (const mode of ['reduced-motion', 'no-javascript']) {
      const fallback = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference', javaScriptEnabled: mode !== 'no-javascript' });
      const fallbackPage = await fallback.newPage();
      fallbackPage.on('pageerror', error => errors.push(error.message));
      assert((await fallbackPage.goto(base, { waitUntil: 'networkidle' })).ok());
      await fallbackPage.locator('.collage-pollination').hover();
      const photos = await fallbackPage.locator('.collage-photo').evaluateAll(elements => elements.map(el => ({ opacity: getComputedStyle(el).opacity, clip: getComputedStyle(el).clipPath, animation: getComputedStyle(el).animationName, height: el.clientHeight })));
      assert(photos.every(photo => photo.opacity === '1' && photo.clip === 'none' && photo.animation === 'none' && photo.height > 60));
      if (mode === 'reduced-motion') assert.equal(await fallbackPage.locator('.collage-pollination img').evaluate(el => getComputedStyle(el).transform), 'none');
      console.log(JSON.stringify({ mode, visiblePhotos: photos.length, automaticAnimations: 0 }));
      await fallback.close();
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ status: 'passed', desktopMotion: motion, premise, browserErrors: errors }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
