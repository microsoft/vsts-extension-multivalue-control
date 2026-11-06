import { expect, test } from "@playwright/test";
import { MultiValuePage } from "../support/MultiValuePage";

test.describe("work item form integration", () => {
  test("refreshes when the control's field changes externally", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c", value: "a" });

    await control.fireFieldChanged("b;c");

    await expect.poll(() => control.tagTexts()).toEqual(["b", "c"]);
  });

  test("ignores changes to other fields", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c", value: "a" });

    // Change the stored value without the control being told about this field.
    await page.evaluate(() => {
      (window as any).__mv.state.value = "c";
      (window as any).__mv.fireOtherFieldChanged();
    });
    await page.waitForTimeout(200);

    expect(await control.tagTexts()).toEqual(["a"]);
  });

  test("saves the work item on Ctrl+S", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b" });

    await page.keyboard.press("Control+S");

    await expect.poll(() => control.saveCalls()).toBe(1);
  });

  test("saves the work item on Cmd+S", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b" });

    await page.keyboard.press("Meta+S");

    await expect.poll(() => control.saveCalls()).toBe(1);
  });

  test("resizes the host frame when the dropdown opens", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c;d;e" });
    const before = (await control.resizes()).at(-1)!;

    await control.openDropdown();

    await expect
      .poll(async () => (await control.resizes()).at(-1)!.height)
      .toBeGreaterThan(before.height);
  });
});
