import { test, expect } from "@playwright/test";

test("profile page renders the voice training checklist shell", async ({ page }) => {
  test.skip(true, "Enable after Clerk test auth is wired in Playwright.");
  await page.goto("/write/profile");
  await expect(page.getByText(/voice training/i)).toBeVisible();
});
