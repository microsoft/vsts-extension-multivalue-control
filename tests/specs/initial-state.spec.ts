import { expect, test } from "@playwright/test";
import { MultiValuePage } from "../support/MultiValuePage";

test.describe("initial state", () => {
  test("shows the placeholder and no tags for an empty field", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c" });

    await expect(control.noSelection).toHaveText("No selection made");
    await expect(control.tags).toHaveCount(0);
  });

  test("renders a tag per stored value and an add button", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c", value: "a;b;c" });

    await expect(control.tags).toHaveCount(3);
    expect(await control.tagTexts()).toEqual(["a", "b", "c"]);
    await expect(control.addButton).toBeVisible();
    await expect(control.noSelection).toHaveCount(0);
  });

  test("trims whitespace and ignores empty segments in the stored value", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c", value: "a; b;;c;" });

    expect(await control.tagTexts()).toEqual(["a", "b", "c"]);
  });

  test("treats a null field value as no selection", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", value: null });

    await expect(control.noSelection).toBeVisible();
  });
});
