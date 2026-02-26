import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // localStorage をクリアしてデフォルト設定で開始
  await page.evaluate(() => localStorage.removeItem("tauri-filer-ui-settings"));
  await page.reload();
});

/** 設定ダイアログを開いて透明化トグルを返すヘルパー */
async function openSettingsAndGetSwitch(page: import("@playwright/test").Page) {
  await page.locator("button[title='設定'], button[title='Settings']").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const toggle = dialog.locator("button[aria-label='Window transparency']");
  await expect(toggle).toBeVisible();
  return { dialog, toggle };
}

/** --color-bg を取得 */
function getCssVar(page: import("@playwright/test").Page, varName: string) {
  return page.evaluate(
    (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim(),
    varName,
  );
}

test("html/body/#root の背景が transparent", async ({ page }) => {
  const results = await page.evaluate(() => {
    const bg = (el: Element | null) =>
      el ? getComputedStyle(el).backgroundColor : "";
    return {
      html: bg(document.documentElement),
      body: bg(document.body),
      root: bg(document.getElementById("root")),
    };
  });
  // transparent は computedStyle では rgba(0, 0, 0, 0)
  expect(results.html).toBe("rgba(0, 0, 0, 0)");
  expect(results.body).toBe("rgba(0, 0, 0, 0)");
  expect(results.root).toBe("rgba(0, 0, 0, 0)");
});

test("透明化ON → --color-bg が rgba になり、-solid に hex が残る", async ({
  page,
}) => {
  const { toggle } = await openSettingsAndGetSwitch(page);

  // 初期状態: OFF
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  const bgBefore = await getCssVar(page, "--color-bg");
  expect(bgBefore).toBe("#0a0a0f");

  // 透明化 ON
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  // --color-bg → rgba(10, 10, 15, 0.8)（デフォルト opacity 80%）
  const bgAfter = await getCssVar(page, "--color-bg");
  expect(bgAfter).toBe("rgba(10, 10, 15, 0.8)");

  // --color-bg-solid に元の hex が保持されている
  const bgSolid = await getCssVar(page, "--color-bg-solid");
  expect(bgSolid).toBe("#0a0a0f");
});

test("不透明度スライダーで rgba の alpha が変化する", async ({ page }) => {
  const { dialog, toggle } = await openSettingsAndGetSwitch(page);

  // 透明化 ON → スライダーが出現
  await toggle.click();
  const slider = dialog.locator("input[type='range']");
  await expect(slider).toBeVisible();

  // スライダー値を 50 に変更
  await slider.fill("50");

  // alpha が 0.5 になる
  const bgColor = await getCssVar(page, "--color-bg");
  expect(bgColor).toBe("rgba(10, 10, 15, 0.5)");
});

test("透明化OFF → --color-bg が hex に戻る", async ({ page }) => {
  const { toggle } = await openSettingsAndGetSwitch(page);

  await toggle.click(); // ON
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  await toggle.click(); // OFF
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  const bgColor = await getCssVar(page, "--color-bg");
  expect(bgColor).toBe("#0a0a0f");
});
