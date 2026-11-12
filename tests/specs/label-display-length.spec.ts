import { expect, test } from "@playwright/test";
import { MultiValuePage } from "../support/MultiValuePage";

const long = "abcdefghij".repeat(4); // 40 characters

test.describe("label display length", () => {
  test("defaults to 35 characters with an ellipsis in options and tags", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: long, value: long });
    await control.openDropdown();

    const truncated = `${long.slice(0, 35)}...`;
    expect(await control.optionLabels()).toEqual([truncated]);
    expect(await control.tagTexts()).toEqual([truncated]);
  });

  test("honors a custom LabelDisplayLength", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: long, LabelDisplayLength: 10 });
    await control.openDropdown();

    expect(await control.optionLabels()).toEqual([`${long.slice(0, 10)}...`]);
  });

  test("does not truncate labels shorter than the limit", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: long, LabelDisplayLength: 100 });
    await control.openDropdown();

    expect(await control.optionLabels()).toEqual([long]);
  });

  test("exposes the full value as a tooltip on truncated options", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: long });
    await control.openDropdown();

    await expect(control.options.locator(`[title="${long}"]`).first()).toBeAttached();
  });

  test("wraps long tag text every 50 characters", async ({ page }) => {
    const value = "x".repeat(120);
    const control = await MultiValuePage.open(page, { Values: value, value, LabelDisplayLength: 200 });

    const [text] = await control.tagTexts();
    expect(text.split("\n").map((l) => l.length)).toEqual([50, 50, 20]);
  });
});
