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

  test("AllowCustom=false: Enter with no match adds nothing and keeps the control usable", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", AllowCustom: false });
    await control.openDropdown();

    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    for (let attempt = 0; attempt < 3; attempt++) {
      await control.filterInput.fill("new");
      await expect(control.options.locator(".ms-Checkbox")).toHaveCount(0);
      await control.filterInput.press("Enter");

      await expect(control.filterInput).toHaveValue("");
      await expect(page.locator(".multi-value-control")).toBeVisible();
      await expect(control.tags).toHaveCount(0);
      await expect(control.noSelection).toBeVisible();
      expect(await control.fieldValue()).toBe("");
      expect(await control.setFieldValueCalls()).toEqual([]);
    }

    await control.filterInput.fill("b");
    await control.filterInput.press("Enter");

    await expect(control.tags).toHaveCount(1);
    expect(await control.tagTexts()).toEqual(["b"]);
    await expect.poll(() => control.fieldValue()).toBe("b");
    expect(pageErrors).toEqual([]);
  });
});
