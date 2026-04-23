import { test, expect } from "@playwright/test";

test("signed-out users are redirected from /write to /auth", async ({ page }) => {
  await page.goto("/write");
  await expect(page).toHaveURL(/\/auth/);
});
