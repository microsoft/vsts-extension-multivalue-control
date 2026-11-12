import { expect, test } from "@playwright/test";
import { MultiValuePage } from "../support/MultiValuePage";

// The control closes the dropdown 150ms after losing focus.
const BLUR_GRACE_MS = 150;

test.describe("dropdown focus", () => {
  test("closes when focus moves outside the control", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b" });
    await control.openDropdown();

    await page.mouse.click(600, 500);

    await expect(control.options).toBeHidden();
  });

  test("stays open when interacting with the filter, options and select all", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b" });
    await control.openDropdown();

    await control.filterInput.click();
    await control.toggle("a");
    await page.waitForTimeout(BLUR_GRACE_MS * 2);

    await expect(control.options).toBeVisible();
  });

  test("clears the filter when the dropdown closes", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b" });
    await control.openDropdown();
    await control.filterInput.fill("a");

    await page.mouse.click(600, 500);
    await expect(control.options).toBeHidden();
    await control.openDropdown();

    await expect(control.filterInput).toHaveValue("");
  });
});
