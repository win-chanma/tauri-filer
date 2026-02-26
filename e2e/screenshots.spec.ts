import { test, expect } from "@playwright/test";

// テーマ切り替えヘルパー: 設定画面を開き、指定テーマを選択して閉じる
async function applyTheme(
  page: import("@playwright/test").Page,
  themeName: string
) {
  await page.locator("button[title='設定'], button[title='Settings']").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Theme セクションへ
  await dialog
    .locator("nav button", { hasText: /テーマ|Theme/ })
    .click();

  // テーマを選択
  await dialog.locator("button", { hasText: themeName }).click();

  // 閉じる
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
}

// ------------------------------------------------------------------
// メイン画面スナップショット
// ------------------------------------------------------------------
test("メイン画面 (default テーマ)", async ({ page }) => {
  await page.goto("/");
  // レイアウトが安定するまで待つ
  await page.locator("aside").waitFor({ state: "visible" });
  await expect(page).toHaveScreenshot("main-default.png");
});

// ------------------------------------------------------------------
// 設定画面スナップショット（各セクション）
// ------------------------------------------------------------------
test("設定画面 - Display セクション", async ({ page }) => {
  await page.goto("/");
  await page.locator("button[title='設定'], button[title='Settings']").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await expect(page).toHaveScreenshot("settings-display.png");
});

test("設定画面 - Theme セクション", async ({ page }) => {
  await page.goto("/");
  await page.locator("button[title='設定'], button[title='Settings']").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog
    .locator("nav button", { hasText: /テーマ|Theme/ })
    .click();

  await expect(page).toHaveScreenshot("settings-theme.png");
});

test("設定画面 - Language セクション", async ({ page }) => {
  await page.goto("/");
  await page.locator("button[title='設定'], button[title='Settings']").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog
    .locator("nav button", { hasText: /言語|Language/ })
    .click();

  await expect(page).toHaveScreenshot("settings-language.png");
});

// ------------------------------------------------------------------
// ターミナルペインスナップショット
// ------------------------------------------------------------------
test("ターミナルペイン表示", async ({ page }) => {
  await page.goto("/");
  await page.locator("aside").waitFor({ state: "visible" });

  // ツールバーのターミナルトグルボタンをクリック
  await page.locator("button[title='ターミナルの切替'], button[title='Toggle terminal']").click();

  // ターミナルコンテナが表示されるまで待つ
  await page.locator("[data-testid='terminal-container']").waitFor({ state: "visible" });
  await page.waitForTimeout(300);

  await expect(page).toHaveScreenshot("terminal-pane.png");
});

// ------------------------------------------------------------------
// 代表テーマのスナップショット（5種）
// ------------------------------------------------------------------
const representativeThemes = [
  "Dracula",
  "Catppuccin Latte",
  "Nord",
  "Tokyo Night",
  "Gruvbox Dark",
];

for (const themeName of representativeThemes) {
  test(`テーマ: ${themeName}`, async ({ page }) => {
    await page.goto("/");
    await page.locator("aside").waitFor({ state: "visible" });

    await applyTheme(page, themeName);

    // テーマ適用後に再描画を待つ
    await page.waitForTimeout(200);

    const slug = themeName.toLowerCase().replace(/\s+/g, "-");
    await expect(page).toHaveScreenshot(`theme-${slug}.png`);
  });
}
