import { test, expect } from "@playwright/test";

test("write home shows drive shell", async ({ page }) => {
  test.skip(true, "Enable after authenticated Playwright storage state is added.");
  await page.goto("/write");
  await expect(page.getByText(/my drive/i)).toBeVisible();
});
