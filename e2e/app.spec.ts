import { test, expect } from "@playwright/test";

test("アプリのトップページが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/tauri-filer/i);
});
