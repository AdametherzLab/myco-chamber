import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createCustomSpeciesStore, CustomSpeciesError, exportProfile, importProfile } from "../src/custom-species.ts";
import { checkConditions } from "../src/chamber.ts";
import type { SpeciesProfile } from "../src/types.ts";

const TEST_DIR = join(import.meta.dir, ".tmp-test");
const TEST_FILE = join(TEST_DIR, "test-species.json");

const validProfile: SpeciesProfile = {
  commonName: "Black Morel",
  scientificName: "Morchella elata",
  incubation: { tempMin: 18, tempMax: 22, humidityMin: 70, humidityMax: 80, co2Max: 5000, faeMin: 1 },
  fruiting: { tempMin: 10, tempMax: 16, humidityMin: 85, humidityMax: 95, co2Max: 600, faeMin: 6 },
  notes: "Requires cold stratification.",
};

const secondProfile: SpeciesProfile = {
  commonName: "Paddy Straw",
  scientificName: "Volvariella volvacea",
  incubation: { tempMin: 30, tempMax: 35, humidityMin: 75, humidityMax: 90, co2Max: 8000, faeMin: 1 },
  fruiting: { tempMin: 28, tempMax: 34, humidityMin: 85, humidityMax: 95, co2Max: 800, faeMin: 4 },
  notes: "Tropical species. Requires high temperatures.",
};

function cleanup() {
  try { if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE); } catch {}
  try { if (existsSync(TEST_DIR)) { const fs = require("node:fs"); fs.rmSync(TEST_DIR, { recursive: true }); } } catch {}
}

describe("CustomSpeciesStore", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  describe("in-memory store", () => {
    it("adds and retrieves a custom species", () => {
      const store = createCustomSpeciesStore();
      const entry = store.add("morel_black", validProfile);

      expect(entry.id).toBe("morel_black");
      expect(entry.profile.commonName).toBe("Black Morel");
      expect(entry.profile.scientificName).toBe("Morchella elata");
      expect(entry.createdAt).toBeTruthy();
      expect(entry.updatedAt).toBeTruthy();
      expect(store.size).toBe(1);

      const retrieved = store.get("morel_black");
      expect(retrieved).toBeDefined();
      expect(retrieved!.profile.commonName).toBe("Black Morel");
    });

    it("rejects duplicate IDs", () => {
      const store = createCustomSpeciesStore();
      store.add("morel_black", validProfile);
      expect(() => store.add("morel_black", validProfile)).toThrow(CustomSpeciesError);
    });

    it("rejects invalid species IDs", () => {
      const store = createCustomSpeciesStore();
      expect(() => store.add("AB", validProfile)).toThrow(CustomSpeciesError);
      expect(() => store.add("123bad", validProfile)).toThrow(CustomSpeciesError);
      expect(() => store.add("a", validProfile)).toThrow(CustomSpeciesError);
      expect(() => store.add("has spaces", validProfile)).toThrow(CustomSpeciesError);
    });

    it("rejects invalid profiles", () => {
      const store = createCustomSpeciesStore();
      const bad = { commonName: "", scientificName: "Test", incubation: {}, fruiting: {} } as unknown as SpeciesProfile;
      expect(() => store.add("test_bad", bad)).toThrow(CustomSpeciesError);
    });

    it("updates an existing species", () => {
      const store = createCustomSpeciesStore();
      store.add("morel_black", validProfile);

      const updated = store.update("morel_black", { commonName: "Black Morel (Updated)" });
      expect(updated.profile.commonName).toBe("Black Morel (Updated)");
      expect(updated.profile.scientificName).toBe("Morchella elata"); // unchanged
      expect(updated.updatedAt).not.toBe(updated.createdAt);
    });

    it("throws when updating non-existent species", () => {
      const store = createCustomSpeciesStore();
      expect(() => store.update("nonexistent", { commonName: "X" })).toThrow(CustomSpeciesError);
    });

    it("removes a species", () => {
      const store = createCustomSpeciesStore();
      store.add("morel_black", validProfile);
      expect(store.remove("morel_black")).toBe(true);
      expect(store.remove("morel_black")).toBe(false);
      expect(store.size).toBe(0);
    });

    it("lists all species", () => {
      const store = createCustomSpeciesStore();
      store.add("morel_black", validProfile);
      store.add("paddy_straw", secondProfile);

      const list = store.list();
      expect(list.length).toBe(2);
      expect(list.map(e => e.id).sort()).toEqual(["morel_black", "paddy_straw"]);
    });

    it("getProfile returns just the profile", () => {
      const store = createCustomSpeciesStore();
      store.add("morel_black", validProfile);

      const profile = store.getProfile("morel_black");
      expect(profile).toBeDefined();
      expect(profile!.commonName).toBe("Black Morel");

      expect(store.getProfile("nonexistent")).toBeUndefined();
    });

    it("clears all species", () => {
      const store = createCustomSpeciesStore();
      store.add("morel_black", validProfile);
      store.add("paddy_straw", secondProfile);
      store.clear();
      expect(store.size).toBe(0);
      expect(store.list()).toEqual([]);
    });
  });

  describe("export and import", () => {
    it("exports and imports species as JSON", () => {
      const store1 = createCustomSpeciesStore();
      store1.add("morel_black", validProfile);
      store1.add("paddy_straw", secondProfile);

      const json = store1.exportJSON();
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe(1);
      expect(Object.keys(parsed.entries).length).toBe(2);

      const store2 = createCustomSpeciesStore();
      const count = store2.importJSON(json);
      expect(count).toBe(2);
      expect(store2.size).toBe(2);
      expect(store2.getProfile("morel_black")!.commonName).toBe("Black Morel");
    });

    it("skips invalid entries during import", () => {
      const json = JSON.stringify({
        version: 1,
        entries: {
          valid_one: { profile: validProfile, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
          "!!invalid": { profile: validProfile, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
          bad_profile: { profile: { commonName: 123 }, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
        },
      });
      const store = createCustomSpeciesStore();
      const count = store.importJSON(json);
      expect(count).toBe(1);
      expect(store.size).toBe(1);
    });

    it("throws on invalid JSON", () => {
      const store = createCustomSpeciesStore();
      expect(() => store.importJSON("not json")).toThrow(CustomSpeciesError);
      expect(() => store.importJSON('{"version":2}')).toThrow(CustomSpeciesError);
    });
  });

  describe("file persistence", () => {
    it("persists to file and loads on new store creation", () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const store1 = createCustomSpeciesStore({ filePath: TEST_FILE });
      store1.add("morel_black", validProfile);
      store1.add("paddy_straw", secondProfile);

      expect(existsSync(TEST_FILE)).toBe(true);

      // Create new store from same file
      const store2 = createCustomSpeciesStore({ filePath: TEST_FILE });
      expect(store2.size).toBe(2);
      expect(store2.getProfile("morel_black")!.commonName).toBe("Black Morel");
      expect(store2.getProfile("paddy_straw")!.scientificName).toBe("Volvariella volvacea");
    });

    it("persists deletions", () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const store1 = createCustomSpeciesStore({ filePath: TEST_FILE });
      store1.add("morel_black", validProfile);
      store1.remove("morel_black");

      const store2 = createCustomSpeciesStore({ filePath: TEST_FILE });
      expect(store2.size).toBe(0);
    });
  });

  describe("integration with checkConditions", () => {
    it("custom profiles work with checkConditions", () => {
      const store = createCustomSpeciesStore();
      store.add("morel_black", validProfile);

      const profile = store.getProfile("morel_black")!;
      const result = checkConditions(profile, "fruiting", {
        temperature: 13,
        humidity: 90,
        co2: 400,
        fae: 7,
      });

      expect(result.species.commonName).toBe("Black Morel");
      expect(result.stage).toBe("fruiting");
      expect(result.alert).toBeDefined();
      expect(result.contaminationRisk).toBeDefined();
    });
  });

  describe("profile import/export", () => {
    it("exports profile to portable JSON", () => {
      const json = exportProfile(validProfile);
      const parsed = JSON.parse(json);
      expect(parsed.commonName).toBe("Black Morel");
      expect(parsed.incubation.tempMin).toBe(18);
    });

    it("imports valid profile JSON", () => {
      const json = exportProfile(validProfile);
      const imported = importProfile(json);
      expect(imported.commonName).toBe("Black Morel");
      expect(imported.incubation.faeMin).toBe(1);
    });

    it("throws when importing invalid JSON structure", () => {
      expect(() => importProfile("{ bad json }")).toThrow(CustomSpeciesError);
    });

    it("throws when importing invalid profile data", () => {
      const badJson = JSON.stringify({
        commonName: "Invalid",
        incubation: { tempMin: "not a number" },
      });
      expect(() => importProfile(badJson)).toThrow(CustomSpeciesError);
    });

    it("roundtrips profile through export/import", () => {
      const original = validProfile;
      const json = exportProfile(original);
      const imported = importProfile(json);
      expect(imported).toEqual(original);
    });
  });
});
