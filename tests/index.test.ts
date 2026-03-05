import { describe, it, expect } from "bun:test";
import {
  getAllSpecies,
  getSpeciesById,
  searchSpeciesByName,
  checkConditions,
  computeContaminationRisk,
  DEFAULT_THRESHOLDS,
  ChamberCalculationError,
  type SpeciesProfile,
  type EnvironmentConditions,
  type AlertResult,
  type ContaminationRisk,
} from "../src/index.ts";

describe("myco-chamber public API", () => {
  it("getAllSpecies returns at least 30 profiles with valid structure", () => {
    const allSpecies = getAllSpecies();

    expect(allSpecies.length).toBeGreaterThanOrEqual(30);

    allSpecies.forEach((profile) => {
      expect(profile).toHaveProperty("commonName");
      expect(typeof profile.commonName).toBe("string");

      expect(profile).toHaveProperty("scientificName");
      expect(typeof profile.scientificName).toBe("string");

      expect(profile).toHaveProperty("incubation");
      expect(profile.incubation).toHaveProperty("tempMin");
      expect(profile.incubation).toHaveProperty("tempMax");
      expect(typeof profile.incubation.tempMin).toBe("number");
      expect(typeof profile.incubation.tempMax).toBe("number");

      expect(profile).toHaveProperty("fruiting");
      expect(profile.fruiting).toHaveProperty("humidityMin");
      expect(profile.fruiting).toHaveProperty("humidityMax");
      expect(typeof profile.fruiting.humidityMin).toBe("number");
      expect(typeof profile.fruiting.humidityMax).toBe("number");
    });
  });

  it("getSpeciesById returns correct profile for known IDs and throws for unknown", () => {
    const allSpecies = getAllSpecies();
    const knownId = allSpecies[0]!.id;

    const foundProfile = getSpeciesById(knownId);
    expect(foundProfile).toBeDefined();
    expect(foundProfile.id).toBe(knownId);

    expect(() => getSpeciesById("nonexistent_species_xyz")).toThrow(RangeError);
  });

  it("checkConditions returns ok status when all readings are within optimal ranges", () => {
    const allSpecies = getAllSpecies();
    const testSpecies = allSpecies.find((s) => s.commonName.toLowerCase().includes("oyster"));
    if (!testSpecies) {
      throw new Error("No oyster species found for test");
    }

    const optimalReading: EnvironmentConditions = {
      temperature: (testSpecies.fruiting.tempMin + testSpecies.fruiting.tempMax) / 2,
      humidity: (testSpecies.fruiting.humidityMin + testSpecies.fruiting.humidityMax) / 2,
      co2: (testSpecies.fruiting.co2Max * 0.5),
      fae: (testSpecies.fruiting.faeMin + 1),
    };

    const result = checkConditions(testSpecies, "fruiting", optimalReading, DEFAULT_THRESHOLDS);

    expect(result.alert.overallSeverity).toBe("ok");
    expect(result.alert.alerts.every((alert) => alert.severity === "ok")).toBe(true);
  });

  it("checkConditions returns critical alerts when temperature is severely out of range", () => {
    const allSpecies = getAllSpecies();
    const testSpecies = allSpecies.find((s) => s.commonName.toLowerCase().includes("shiitake"));
    if (!testSpecies) {
      throw new Error("No shiitake species found for test");
    }

    const extremeReading: EnvironmentConditions = {
      temperature: testSpecies.fruiting.tempMax + 15,
      humidity: (testSpecies.fruiting.humidityMin + testSpecies.fruiting.humidityMax) / 2,
      co2: (testSpecies.fruiting.co2Max * 0.5),
      fae: (testSpecies.fruiting.faeMin + 1),
    };

    const result = checkConditions(testSpecies, "fruiting", extremeReading, DEFAULT_THRESHOLDS);

    const temperatureAlert = result.alert.alerts.find((alert) => alert.parameter === "temperature");
    expect(temperatureAlert).toBeDefined();
    expect(temperatureAlert!.severity).toBe("critical");
    expect(result.alert.overallSeverity).toBe("critical");
  });

  it("searchSpeciesByName finds species by partial common name", () => {
    const results = searchSpeciesByName("oyster");

    expect(results.length).toBeGreaterThan(0);
    results.forEach((profile) => {
      expect(
        profile.commonName.toLowerCase().includes("oyster") ||
          profile.scientificName.toLowerCase().includes("oyster")
      ).toBe(true);
    });

    const emptyResults = searchSpeciesByName("");
    expect(emptyResults.length).toBe(0);

    const noResults = searchSpeciesByName("nonexistentmushroomxyz");
    expect(noResults.length).toBe(0);
  });
});