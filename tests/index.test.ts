import { describe, it, expect } from "bun:test";
import {
  getAllSpecies,
  getSpeciesById,
  searchSpeciesByName,
  getSpeciesByStageConditions,
  checkConditions,
  computeContaminationRisk,
  calculateSubstrate,
  calculateMoistureContent,
  estimateTimeline,
  SUBSTRATE_RECIPES,
  DEFAULT_THRESHOLDS,
  isEnvironmentConditions,
  isStageRanges,
  isSpeciesProfile,
  ChamberCalculationError,
  type SpeciesProfile,
  type EnvironmentConditions,
  type AlertResult,
  type ContaminationRisk,
  type SubstrateIngredient,
} from "../src/index.ts";

describe("input validators", () => {
  it("isEnvironmentConditions validates correct inputs", () => {
    const valid: EnvironmentConditions = {
      temperature: 22,
      humidity: 85,
      co2: 500,
      fae: 4,
    };
    expect(isEnvironmentConditions(valid)).toBe(true);

    const invalidHumidity = { ...valid, humidity: 110 };
    expect(isEnvironmentConditions(invalidHumidity)).toBe(false);

    const negativeCO2 = { ...valid, co2: -100 };
    expect(isEnvironmentConditions(negativeCO2)).toBe(false);

    const missingFAE = { temperature: 22, humidity: 85, co2: 500 };
    expect(isEnvironmentConditions(missingFAE)).toBe(false);
  });

  it("isStageRanges validates correct inputs", () => {
    const valid: StageRanges = {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 5000,
      faeMin: 1,
    };
    expect(isStageRanges(valid)).toBe(true);

    const invertedTemp = { ...valid, tempMin: 25, tempMax: 20 };
    expect(isStageRanges(invertedTemp)).toBe(false);

    const humidityOver100 = { ...valid, humidityMax: 101 };
    expect(isStageRanges(humidityOver100)).toBe(false);
  });

  it("isSpeciesProfile validates correct inputs", () => {
    const species = getSpeciesById("shiitake");
    expect(isSpeciesProfile(species)).toBe(true);

    const invalid = { ...species, incubation: { tempMin: "20" } } as unknown;
    expect(isSpeciesProfile(invalid)).toBe(false);
  });
});

// Rest of the test file remains unchanged...
