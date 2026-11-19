import { expect, test } from "@playwright/test";
import { MultiValuePage } from "../support/MultiValuePage";

test.describe("option sources", () => {
  test("uses the allowed values of the backing field (picklist) and skips values containing ';'", async ({ page }) => {
    const control = await MultiValuePage.open(page, { allowedValues: ["a", "b;c", "d"] });
    await control.openDropdown();

    expect(await control.optionLabels()).toEqual(["a", "d"]);
  });

  test("uses the semicolon separated Values input (string field), trimmed and without empties", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "x; y ;;z" });
    await control.openDropdown();

    expect(await control.optionLabels()).toEqual(["x", "y", "z"]);
  });

  test("Values input takes precedence over the allowed values", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "x;y", allowedValues: ["a", "b"] });
    await control.openDropdown();

    expect(await control.optionLabels()).toEqual(["x", "y"]);
  });
});
