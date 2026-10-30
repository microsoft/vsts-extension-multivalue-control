import { expect, test } from "@playwright/test";
import { MultiValuePage } from "../support/MultiValuePage";

test.describe("selection", () => {
  test("opens and closes the dropdown from the placeholder/add button", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c" });

    await control.noSelection.click();
    await expect(control.options).toBeVisible();
    await control.noSelection.click();
    await expect(control.options).toBeHidden();
  });

  test("checking an option adds a tag and writes the value to the field", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c" });
    await control.openDropdown();

    await control.toggle("b");

    await expect(control.tags).toHaveCount(1);
    expect(await control.tagTexts()).toEqual(["b"]);
    expect(await control.fieldValue()).toBe("b");
    await expect(control.checkbox("b").locator("input")).toBeChecked();
  });

  test("stores selected values in option order, not click order", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c" });
    await control.openDropdown();

    await control.toggle("c");
    await control.toggle("a");

    await expect.poll(() => control.fieldValue()).toBe("a;c");
  });

  test("unchecking an option removes its tag", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c", value: "a;b" });
    await control.openDropdown();

    await control.toggle("a");

    expect(await control.tagTexts()).toEqual(["b"]);
    expect(await control.fieldValue()).toBe("b");
  });

  test("clicking the x on a tag removes it and updates the field", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c", value: "a;b;c" });

    await control.removeTag(1);

    expect(await control.tagTexts()).toEqual(["a", "c"]);
    expect(await control.fieldValue()).toBe("a;c");
  });

  test("removing the last tag brings back the placeholder", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", value: "a" });

    await control.removeTag(0);

    await expect(control.noSelection).toBeVisible();
    expect(await control.fieldValue()).toBe("");
  });

  test("shows stored values that are not in the options as tags and checked options", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", value: "a;z" });
    await control.openDropdown();

    expect(await control.tagTexts()).toEqual(["a", "z"]);
    expect(await control.optionLabels()).toEqual(["a", "b", "z"]);
    await expect(control.checkbox("z").locator("input")).toBeChecked();
  });
});

test.describe("select all", () => {
  test("selects every option and clears them on the second click", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c" });
    await control.openDropdown();

    await control.toggle("Select All");
    await expect(control.tags).toHaveCount(3);
    expect(await control.fieldValue()).toBe("a;b;c");

    await control.toggle("Select All");
    await expect(control.tags).toHaveCount(0);
    expect(await control.fieldValue()).toBe("");
  });

  test("is checked only while every option is selected", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c", value: "a;b;c" });
    await control.openDropdown();
    const selectAll = control.checkbox("Select All").locator("input");

    await expect(selectAll).toBeChecked();
    await control.toggle("b");
    await expect(selectAll).not.toBeChecked();
  });

  test("is hidden while a filter is active", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b;c" });
    await control.openDropdown();
    await expect(control.checkbox("Select All")).toBeVisible();

    await control.filterInput.fill("a");

    await expect(control.checkbox("Select All")).toHaveCount(0);
  });
});
