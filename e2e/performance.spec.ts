import { test, expect } from "@playwright/test";

test.describe("Startup Performance", () => {
  test("measure initial page load performance", async ({ page }) => {
    const navStart = Date.now();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const domContentLoaded = Date.now() - navStart;

    await page.waitForLoadState("load");
    const fullLoad = Date.now() - navStart;

    // サイドバーが表示されるまで（UIの描画完了指標）
    let sidebarTime = -1;
    try {
      await page.locator("aside").waitFor({ state: "visible", timeout: 10000 });
      sidebarTime = Date.now() - navStart;
    } catch {
      console.log("WARNING: Sidebar NOT visible within 10s");
    }

    // Navigation Timing API
    const timing = await page.evaluate(() => {
      const perf = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      return {
        ttfb: Math.round(perf.responseStart - perf.requestStart),
        domInteractive: Math.round(perf.domInteractive - perf.fetchStart),
        domComplete: Math.round(perf.domComplete - perf.fetchStart),
        loadEvent: Math.round(perf.loadEventEnd - perf.fetchStart),
      };
    });

    // リソース一覧（遅い順トップ15）
    const resources = await page.evaluate(() => {
      const entries =
        performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      return entries
        .map((e) => ({
          name: e.name.split("/").pop()?.substring(0, 60) || "",
          type: e.initiatorType,
          duration: Math.round(e.duration),
          size: e.transferSize,
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 15);
    });

    // JSバンドル（サイズ順）
    const jsBundles = await page.evaluate(() => {
      const entries =
        performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      return entries
        .filter(
          (e) =>
            e.name.endsWith(".js") ||
            e.name.endsWith(".tsx") ||
            e.name.includes(".ts"),
        )
        .map((e) => ({
          name: e.name.split("/").pop()?.substring(0, 60) || "",
          size: e.transferSize,
          duration: Math.round(e.duration),
        }))
        .sort((a, b) => (b.size || 0) - (a.size || 0))
        .slice(0, 20);
    });

    // Long Tasks検出
    const longTasks = await page.evaluate(() => {
      return new Promise<Array<{ duration: number; startTime: number }>>(
        (resolve) => {
          const tasks: Array<{ duration: number; startTime: number }> = [];
          const obs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              tasks.push({
                duration: Math.round(entry.duration),
                startTime: Math.round(entry.startTime),
              });
            }
          });
          try {
            obs.observe({ type: "longtask", buffered: true });
          } catch {
            // longtask not supported
          }
          setTimeout(() => {
            obs.disconnect();
            resolve(tasks);
          }, 3000);
        },
      );
    });

    // 結果出力
    console.log("\n========================================");
    console.log("  STARTUP PERFORMANCE REPORT");
    console.log("========================================\n");
    console.log(`DOM Content Loaded: ${domContentLoaded}ms`);
    console.log(`Full Page Load:     ${fullLoad}ms`);
    console.log(`Sidebar Visible:    ${sidebarTime}ms`);
    console.log("\n--- Navigation Timing ---");
    console.log(`  TTFB:             ${timing.ttfb}ms`);
    console.log(`  DOM Interactive:   ${timing.domInteractive}ms`);
    console.log(`  DOM Complete:      ${timing.domComplete}ms`);
    console.log(`  Load Event:        ${timing.loadEvent}ms`);

    console.log("\n--- Top 15 Slowest Resources ---");
    for (const r of resources) {
      const sizeKB = r.size ? `${(r.size / 1024).toFixed(1)}KB` : "N/A";
      console.log(
        `  ${r.duration}ms | ${sizeKB.padStart(8)} | ${r.type.padEnd(6)} | ${r.name}`,
      );
    }

    console.log("\n--- JS Bundles (by size) ---");
    for (const b of jsBundles) {
      const sizeKB = b.size ? `${(b.size / 1024).toFixed(1)}KB` : "N/A";
      console.log(
        `  ${sizeKB.padStart(8)} | ${b.duration}ms | ${b.name}`,
      );
    }

    console.log(`\n--- Long Tasks (>50ms) ---`);
    if (longTasks.length === 0) {
      console.log("  No long tasks detected");
    } else {
      for (const t of longTasks) {
        console.log(`  ${t.duration}ms at ${t.startTime}ms`);
      }
    }
    console.log("\n========================================\n");

    // 基本的なパフォーマンスアサーション
    expect(sidebarTime).toBeGreaterThan(0);
    expect(sidebarTime).toBeLessThan(10000);
  });

  test("measure cached page load (2nd visit)", async ({ page }) => {
    // 1回目: キャッシュを温める
    await page.goto("/", { waitUntil: "load" });
    await page.locator("aside").waitFor({ state: "visible", timeout: 10000 });

    // 2回目: キャッシュ済みロード
    const navStart = Date.now();
    await page.reload({ waitUntil: "load" });
    await page.locator("aside").waitFor({ state: "visible", timeout: 10000 });
    const cachedLoad = Date.now() - navStart;

    const timing = await page.evaluate(() => {
      const perf = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      return {
        domInteractive: Math.round(perf.domInteractive - perf.fetchStart),
        domComplete: Math.round(perf.domComplete - perf.fetchStart),
        loadEvent: Math.round(perf.loadEventEnd - perf.fetchStart),
      };
    });

    console.log("\n========================================");
    console.log("  CACHED LOAD PERFORMANCE");
    console.log("========================================\n");
    console.log(`Cached Full Load:    ${cachedLoad}ms`);
    console.log(`DOM Interactive:     ${timing.domInteractive}ms`);
    console.log(`DOM Complete:        ${timing.domComplete}ms`);
    console.log(`Load Event:          ${timing.loadEvent}ms`);
    console.log("\n========================================\n");

    expect(cachedLoad).toBeLessThan(10000);
  });

  test("measure theme initialization overhead", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.locator("aside").waitFor({ state: "visible", timeout: 10000 });

    // テーマ適用のオーバーヘッドを計測
    const themeMetrics = await page.evaluate(() => {
      const start = performance.now();
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      // CSS変数の数を数える
      const allStyles = computedStyle.cssText;
      const cssVarCount = (allStyles.match(/--[a-z]/g) || []).length;

      const elapsed = performance.now() - start;

      return {
        cssVarReadTime: Math.round(elapsed * 100) / 100,
        cssVarCount,
      };
    });

    console.log("\n========================================");
    console.log("  THEME INITIALIZATION METRICS");
    console.log("========================================\n");
    console.log(`CSS Variable Count:    ${themeMetrics.cssVarCount}`);
    console.log(`CSS Var Read Time:     ${themeMetrics.cssVarReadTime}ms`);
    console.log("\n========================================\n");
  });

  test("measure store initialization", async ({ page }) => {
    // ストア初期化のパフォーマンスを計測
    await page.goto("/", { waitUntil: "load" });
    await page.locator("aside").waitFor({ state: "visible", timeout: 10000 });

    const storeMetrics = await page.evaluate(() => {
      // localStorageのサイズを確認
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || "";
          totalSize += key.length + value.length;
        }
      }

      // DOMノード数
      const domNodeCount = document.querySelectorAll("*").length;

      // イベントリスナーの推定
      return {
        localStorageSize: totalSize,
        localStorageKeys: localStorage.length,
        domNodeCount,
      };
    });

    console.log("\n========================================");
    console.log("  STORE / DOM METRICS");
    console.log("========================================\n");
    console.log(
      `localStorage Size:     ${(storeMetrics.localStorageSize / 1024).toFixed(1)}KB`,
    );
    console.log(`localStorage Keys:     ${storeMetrics.localStorageKeys}`);
    console.log(`DOM Node Count:        ${storeMetrics.domNodeCount}`);
    console.log("\n========================================\n");
  });
});
