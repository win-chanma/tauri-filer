import { test, expect } from "@playwright/test";

test("アプリのトップページが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/tauri-filer/i);
});

test("メインレイアウト要素が表示される", async ({ page }) => {
  await page.goto("/");

  // Toolbar が表示される
  const toolbar = page.locator("button", { hasText: /設定|Settings/ }).first();
  await expect(toolbar).toBeVisible();

  // StatusBar が表示される（項目数テキスト）
  const statusBar = page.getByText(/項目|items/);
  await expect(statusBar).toBeVisible();
});

test("サイドバーが表示される", async ({ page }) => {
  await page.goto("/");

  // サイドバーの「場所」セクションが表示される
  const sidebar = page.locator("aside");
  await expect(sidebar).toBeVisible();

  // サイドバーにホームリンクがある
  const homeLink = sidebar.getByText(/ホーム|Home/);
  await expect(homeLink).toBeVisible();
});
