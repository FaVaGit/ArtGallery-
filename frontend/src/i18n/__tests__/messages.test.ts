import { describe, it, expect } from "vitest";
import { getMessages } from "../../i18n/messages";

describe("i18n messages", () => {
  it("returns English messages for 'en'", () => {
    const m = getMessages("en");
    expect(m.portfolio.title).toBeTruthy();
    expect(m.portfolio.newFolder).toBe("New Folder");
  });

  it("returns Italian messages for 'it'", () => {
    const m = getMessages("it");
    expect(m.portfolio.title).toBeTruthy();
    expect(m.portfolio.newFolder).toBe("Nuova Cartella");
  });

  it("has matching keys between EN and IT", () => {
    const en = getMessages("en");
    const it = getMessages("it");

    // Check that all top-level sections exist in both
    const enKeys = Object.keys(en).sort();
    const itKeys = Object.keys(it).sort();
    expect(enKeys).toEqual(itKeys);

    // Check portfolio subsection keys match
    const enPortfolio = Object.keys(en.portfolio).sort();
    const itPortfolio = Object.keys(it.portfolio).sort();
    expect(enPortfolio).toEqual(itPortfolio);
  });

  it("has no empty string values in EN", () => {
    const en = getMessages("en");
    for (const [section, values] of Object.entries(en)) {
      if (typeof values === "object" && values !== null) {
        for (const [key, val] of Object.entries(values as Record<string, string>)) {
          expect(val, `en.${section}.${key} should not be empty`).not.toBe("");
        }
      }
    }
  });

  it("has no empty string values in IT", () => {
    const it = getMessages("it");
    for (const [section, values] of Object.entries(it)) {
      if (typeof values === "object" && values !== null) {
        for (const [key, val] of Object.entries(values as Record<string, string>)) {
          expect(val, `it.${section}.${key} should not be empty`).not.toBe("");
        }
      }
    }
  });

  it("includes cancel key in portfolio section", () => {
    const en = getMessages("en");
    const it = getMessages("it");
    expect(en.portfolio.cancel).toBe("Cancel");
    expect(it.portfolio.cancel).toBe("Annulla");
  });

  it("includes search mode keys (Phase 3)", () => {
    const en = getMessages("en");
    const it = getMessages("it");
    expect(en.portfolio.searchFullText).toBeTruthy();
    expect(en.portfolio.searchByName).toBeTruthy();
    expect(it.portfolio.searchFullText).toBeTruthy();
    expect(it.portfolio.searchByName).toBeTruthy();
  });
});
