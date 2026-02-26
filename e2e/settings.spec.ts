import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("ツールバーのギアアイコンから設定画面を開ける", async ({ page }) => {
  // 設定ボタンをクリック（title 属性で特定）
  await page.locator("button[title='設定'], button[title='Settings']").click();

  // 設定ダイアログが表示される
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // タイトルが表示される
  await expect(dialog.getByText(/設定|Settings/)).toBeVisible();
});

test("3つのセクションを切り替えられる", async ({ page }) => {
  await page.locator("button[title='設定'], button[title='Settings']").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Display セクション（デフォルトで表示）
  await expect(dialog.getByText(/隠しファイル|hidden files/i)).toBeVisible();

  // Theme セクションに切り替え
  await dialog
    .locator("nav button", { hasText: /テーマ|Theme/ })
    .click();
  // テーマスウォッチが表示される（gridのボタン群）
  await expect(dialog.locator("button", { hasText: "Dracula" })).toBeVisible();

  // Language セクションに切り替え
  await dialog
    .locator("nav button", { hasText: /言語|Language/ })
    .click();
  // 言語セレクトが表示される
  await expect(dialog.locator("select[aria-label='Language']")).toBeVisible();
});

test("テーマ選択で画面に反映される", async ({ page }) => {
  await page.locator("button[title='設定'], button[title='Settings']").click();
  const dialog = page.getByRole("dialog");

  // Theme セクションに切り替え
  await dialog
    .locator("nav button", { hasText: /テーマ|Theme/ })
    .click();

  // Dracula テーマを選択
  await dialog.locator("button", { hasText: "Dracula" }).click();

  // CSS変数が変わったことを確認（Dracula の bg = #282a36）
  const bgColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-bg")
      .trim()
  );
  expect(bgColor).toBe("#282a36");
});

test("ESCキーで設定画面を閉じられる", async ({ page }) => {
  await page.locator("button[title='設定'], button[title='Settings']").click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // ESC キーを押す
  await page.keyboard.press("Escape");

  // ダイアログが消える
  await expect(dialog).not.toBeVisible();
});
