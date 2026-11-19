import { expect, test } from "@playwright/test";
import { MultiValuePage } from "../support/MultiValuePage";

test.describe("read-only and error states", () => {
  test("does not write to a read-only field", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", readOnly: true });
    await control.openDropdown();

    await control.toggle("a");

    await expect.poll(() => control.warnings()).toContainEqual(expect.stringContaining("read only"));
    expect(await control.setFieldValueCalls()).toEqual([]);
    await expect(control.tags).toHaveCount(0);
  });

  test("warns and changes nothing when the field is not on the form", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", fieldExists: false });
    await control.openDropdown();

    await control.toggle("a");

    await expect.poll(() => control.warnings()).toContainEqual(expect.stringContaining("not found"));
    expect(await control.setFieldValueCalls()).toEqual([]);
  });

  test("explains how to fix an invalid picklist field after a change", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b", invalid: true, isPicklist: true });
    await control.openDropdown();

    await control.toggle("a");

    await expect(control.error).toContainText("Set the field Test Field to use suggested values");
    const link = control.error.getByRole("link", { name: "See documentation" });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("href", /vsts-extension-multivalue-control/);
  });

  test("shows no error for a valid field", async ({ page }) => {
    const control = await MultiValuePage.open(page, { Values: "a;b" });
    await control.openDropdown();

    await control.toggle("a");

    await expect(control.tags).toHaveCount(1);
    await expect(control.error).toHaveText("");
  });
});
