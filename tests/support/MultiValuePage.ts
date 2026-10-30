import { expect, Locator, Page } from "@playwright/test";

export interface HarnessConfig {
  FieldName?: string;
  /** Semicolon separated "Values" control input. */
  Values?: string;
  AllowCustom?: boolean;
  LabelDisplayLength?: number;
  /** Initial stored field value. */
  value?: string | null;
  /** Suggested/allowed values of the backing field. */
  allowedValues?: string[];
  readOnly?: boolean;
  isPicklist?: boolean;
  invalid?: boolean;
  fieldExists?: boolean;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class MultiValuePage {
  readonly noSelection: Locator;
  readonly addButton: Locator;
  readonly tags: Locator;
  readonly options: Locator;
  readonly filterInput: Locator;
  readonly error: Locator;

  constructor(readonly page: Page) {
    this.noSelection = page.locator(".NoSlectionBtn");
    this.addButton = page.locator(".AddBtn");
    this.tags = page.locator(".customTagPicker");
    this.options = page.locator(".options");
    this.filterInput = page.getByPlaceholder("Filter values");
    this.error = page.locator(".error");
  }

  static async open(page: Page, config: HarnessConfig = {}): Promise<MultiValuePage> {
    // Icon fonts are fetched from a CDN; keep tests offline and fast.
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    await page.goto(`/tests/harness/harness.html?cfg=${encodeURIComponent(JSON.stringify(config))}`);
    const control = new MultiValuePage(page);
    await expect(page.locator(".multi-value-control")).toBeVisible();
    return control;
  }

  checkbox(label: string): Locator {
    return this.options.locator(".ms-Checkbox").filter({
      has: this.page.locator(".ms-Checkbox-text", { hasText: new RegExp(`^${escapeRegExp(label)}$`) }),
    });
  }

  async openDropdown(): Promise<void> {
    const trigger = (await this.noSelection.count()) ? this.noSelection : this.addButton;
    await trigger.click();
    await expect(this.options).toBeVisible();
  }

  async toggle(label: string): Promise<void> {
    await this.checkbox(label).locator("label").click();
  }

  async optionLabels(): Promise<string[]> {
    const labels = await this.options.locator(".ms-Checkbox-text").allTextContents();
    return labels.filter((l) => l !== "Select All");
  }

  async tagTexts(): Promise<string[]> {
    return this.tags.locator(".tag-text").allTextContents();
  }

  removeTag(index: number): Promise<void> {
    return this.tags.nth(index).locator(".closeIconcustom").click();
  }

  /** The value most recently written to the work item field. */
  fieldValue(): Promise<string> {
    return this.page.evaluate(() => (window as any).__mv.state.value);
  }

  setFieldValueCalls(): Promise<string[]> {
    return this.page.evaluate(() => (window as any).__mv.state.setCalls);
  }

  saveCalls(): Promise<number> {
    return this.page.evaluate(() => (window as any).__mv.state.saveCalls);
  }

  resizes(): Promise<{ width: number; height: number }[]> {
    return this.page.evaluate(() => (window as any).__mv.state.resizes);
  }

  warnings(): Promise<string[]> {
    return this.page.evaluate(() => (window as any).__mv.state.warnings);
  }

  /** Simulates the work item form reporting a field change from outside the control. */
  async fireFieldChanged(value: string): Promise<void> {
    await this.page.evaluate((v) => (window as any).__mv.fireFieldChanged(v), value);
  }
}
