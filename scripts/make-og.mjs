// Render the default Open Graph image (1200x630) with Playwright.
// Run with: node scripts/make-og.mjs
import { chromium } from "playwright";

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; }
  .og {
    width: 1200px; height: 630px; box-sizing: border-box;
    background: #fbfaf7; padding: 92px;
    display: flex; flex-direction: column; justify-content: center;
  }
  .name {
    font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 30px; letter-spacing: 0.12em; text-transform: uppercase;
    color: #6c6a63;
  }
  .head {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 92px; line-height: 1.04; color: #1b1a17;
    margin-top: 28px; max-width: 920px;
  }
  .accent { color: #1f6b54; }
  .foot {
    font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 27px; color: #6c6a63; margin-top: 44px;
  }
</style></head><body>
  <div class="og">
    <div class="name">Jake Herridge</div>
    <div class="head">I build AI that <span class="accent">earns its keep.</span></div>
    <div class="foot">jakeherridge.com</div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({ path: "public/og-default.png" });
await browser.close();
console.log("Wrote public/og-default.png");
