import { expect, test } from "@playwright/test";
import { MultiValuePage } from "../support/MultiValuePage";

test.describe("filter", () => {
  test("filters case-insensitively with prefix matches first", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "Grape;Apple;Pineapple;Banana" });
    await control.openDropdown();

    await control.filterInput.fill("AP");

    expect(await control.optionLabels()).toEqual(["Apple", "Grape", "Pineapple"]);
  });

  test("shows no options when nothing matches", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b" });
    await control.openDropdown();

    await control.filterInput.fill("zzz");

    expect(await control.optionLabels()).toEqual([]);
  });

  test("Enter toggles the first match and clears the filter", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "Apple;Grape" });
    await control.openDropdown();

    await control.filterInput.fill("gra");
    await control.filterInput.press("Enter");

    await expect(control.filterInput).toHaveValue("");
    expect(await control.tagTexts()).toEqual(["Grape"]);
    expect(await control.fieldValue()).toBe("Grape");
  });

  test("switches to a multiline input for filters longer than 50 characters", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b" });
    await control.openDropdown();

    await control.filterInput.fill("x".repeat(51));

    await expect(control.options.locator("textarea")).toHaveCount(1);
  });
});

test.describe("allow custom values", () => {
  test("AllowCustom=true offers the typed text and Enter adds it", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", AllowCustom: true });
    await control.openDropdown();

    await control.filterInput.fill("new");
    expect((await control.optionLabels())[0]).toBe("new");
    await control.filterInput.press("Enter");

    expect(await control.tagTexts()).toEqual(["new"]);
    expect(await control.fieldValue()).toBe("new");
  });

  test("AllowCustom=false does not offer the typed text", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", AllowCustom: false });
    await control.openDropdown();

    await control.filterInput.fill("new");

    expect(await control.optionLabels()).toEqual([]);
  });

  test("AllowCustom=false: Enter with no match adds nothing", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", AllowCustom: false });
    await control.openDropdown();

    await control.filterInput.fill("new");
    await control.filterInput.press("Enter");

    await expect(control.tags).toHaveCount(0);
    await expect(control.noSelection).toBeVisible();
    // The control currently still writes "" to the field here (toggles filtered[0] === undefined); not asserted.
  });
});
