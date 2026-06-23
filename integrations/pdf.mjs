import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

/**
 * Generate a print PDF for each published white paper after the build.
 * Serves dist/ over a local port and drives Chromium (Playwright) over each
 * paper page. Skips gracefully when Playwright or Chromium is unavailable.
 */
export default function paperPdf() {
  return {
    name: "paper-pdf",
    hooks: {
      "astro:build:done": async ({ dir, pages, logger }) => {
        const root = fileURLToPath(dir);
        const slugs = pages
          .map((p) => p.pathname.replace(/^\//, ""))
          .filter((u) => u.startsWith("papers/") && u.endsWith("/") && u !== "papers/")
          .map((u) => u.slice("papers/".length, -1));

        if (slugs.length === 0) {
          logger.info("No paper pages found, skipping PDF generation.");
          return;
        }

        let chromium;
        try {
          ({ chromium } = await import("playwright"));
        } catch {
          logger.warn("playwright is not installed, skipping PDF generation.");
          return;
        }

        const server = createServer(async (req, res) => {
          try {
            let p = decodeURIComponent((req.url || "/").split("?")[0]);
            if (p.endsWith("/")) p += "index.html";
            const data = await readFile(join(root, p));
            const ext = p.slice(p.lastIndexOf("."));
            res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
            res.end(data);
          } catch {
            res.writeHead(404);
            res.end("Not found");
          }
        });
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        const { port } = server.address();

        let browser;
        try {
          browser = await chromium.launch();
        } catch (err) {
          logger.warn(`Could not launch Chromium, skipping PDF generation: ${err.message}`);
          await new Promise((r) => server.close(r));
          return;
        }

        for (const slug of slugs) {
          const page = await browser.newPage();
          await page.goto(`http://127.0.0.1:${port}/papers/${slug}/`, {
            waitUntil: "networkidle",
          });
          await page.emulateMedia({ media: "print" });
          await page.pdf({
            path: join(root, "papers", `${slug}.pdf`),
            format: "A4",
            printBackground: true,
            margin: { top: "18mm", bottom: "18mm", left: "18mm", right: "18mm" },
          });
          await page.close();
          logger.info(`Generated /papers/${slug}.pdf`);
        }

        await browser.close();
        await new Promise((r) => server.close(r));
      },
    },
  };
}
