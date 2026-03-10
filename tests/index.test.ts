import { describe, it, expect } from "bun:test";
import {
  getAllSpecies,
  getSpeciesById,
  searchSpeciesByName,
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
  type CustomSubstrateRecipeInput,
  TimelineVisualizer,
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

describe("species-db", () => {
  it("getAllSpecies should return an array of species profiles", () => {
    const species = getAllSpecies();
    expect(Array.isArray(species)).toBe(true);
    expect(species.length).toBeGreaterThan(0);
    expect(species[0]).toHaveProperty("commonName");
  });

  it("getSpeciesById should return a species profile for a valid ID", () => {
    const shiitake = getSpeciesById("shiitake");
    expect(shiitake).toBeDefined();
    expect(shiitake.commonName).toBe("Shiitake");
  });

  it("getSpeciesById should throw an error for an invalid ID", () => {
    expect(() => getSpeciesById("nonexistent")).toThrow("Species with ID 'nonexistent' not found.");
  });

  it("searchSpeciesByName should return matching species", () => {
    const oysters = searchSpeciesByName("oyster");
    expect(oysters.length).toBeGreaterThan(0);
    expect(oysters.every((s) => s.commonName.toLowerCase().includes("oyster"))).toBe(true);

    const shiitake = searchSpeciesByName("shiitake");
    expect(shiitake.length).toBe(1);
    expect(shiitake[0].commonName).toBe("Shiitake");
  });

  it("searchSpeciesByName should be case-insensitive", () => {
    const shiitake = searchSpeciesByName("SHIITAKE");
    expect(shiitake.length).toBe(1);
    expect(shiitake[0].commonName).toBe("Shiitake");
  });

  it("searchSpeciesByName should return empty array for no matches", () => {
    const noMatches = searchSpeciesByName("xyz");
    expect(noMatches.length).toBe(0);
  });
});

describe("chamber", () => {
  const shiitake = getSpeciesById("shiitake");

  it("checkConditions should return OK for optimal conditions", () => {
    const conditions: EnvironmentConditions = {
      temperature: 20,
      humidity: 80,
      co2: 800,
      fae: 2,
    };
    const result = checkConditions(shiitake, "incubation", conditions);
    expect(result.alert.overallSeverity).toBe("ok");
    expect(result.alert.alerts.length).toBe(0);
  });

  it("checkConditions should return Warning for slight deviations", () => {
    const conditions: EnvironmentConditions = {
      temperature: 25,
      humidity: 80,
      co2: 800,
      fae: 2,
    };
    const result = checkConditions(shiitake, "incubation", conditions);
    expect(result.alert.overallSeverity).toBe("warning");
    expect(result.alert.alerts[0].parameter).toBe("temperature");
  });

  it("checkConditions should return Critical for major deviations", () => {
    const conditions: EnvironmentConditions = {
      temperature: 30,
      humidity: 80,
      co2: 800,
      fae: 2,
    };
    const result = checkConditions(shiitake, "incubation", conditions);
    expect(result.alert.overallSeverity).toBe("critical");
    expect(result.alert.alerts[0].parameter).toBe("temperature");
  });

  it("checkConditions should handle custom thresholds", () => {
    const conditions: EnvironmentConditions = {
      temperature: 23,
      humidity: 80,
      co2: 800,
      fae: 2,
    };
    const customThresholds = { warningThresholdPercent: 5, criticalThresholdPercent: 15 };
    const result = checkConditions(shiitake, "incubation", conditions, customThresholds);
    expect(result.alert.overallSeverity).toBe("critical"); // 23 is > 5% above 22 max
  });

  it("checkConditions should throw ChamberCalculationError for invalid inputs", () => {
    const conditions: EnvironmentConditions = {
      temperature: 20,
      humidity: 80,
      co2: 800,
      fae: 2,
    };
    expect(() => checkConditions(shiitake, "invalid_stage" as any, conditions)).toThrow(ChamberCalculationError);
    expect(() => checkConditions(shiitake, "incubation", { ...conditions, humidity: 101 })).toThrow(ChamberCalculationError);
  });

  it("computeContaminationRisk should return a risk assessment", () => {
    const conditions: EnvironmentConditions = {
      temperature: 28,
      humidity: 95,
      co2: 5000,
      fae: 0.5,
    };
    const result: ContaminationRisk = computeContaminationRisk(conditions);
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("computeContaminationRisk should return low risk for good conditions", () => {
    const conditions: EnvironmentConditions = {
      temperature: 20,
      humidity: 80,
      co2: 500,
      fae: 4,
    };
    const result: ContaminationRisk = computeContaminationRisk(conditions);
    expect(result.score).toBe(0);
    expect(result.recommendations.length).toBe(0);
  });
});

describe("substrate", () => {
  it("calculateMoistureContent should return correct weighted average", () => {
    const ingredients: SubstrateIngredient[] = [
      { name: "Sawdust", weightGrams: 1000, moisturePercent: 10 },
      { name: "Water", weightGrams: 500, moisturePercent: 100 },
    ];
    expect(calculateMoistureContent(ingredients)).toBeCloseTo(40);
  });

  it("calculateMoistureContent should return 0 for empty array", () => {
    expect(calculateMoistureContent([])).toBe(0);
  });

  it("calculateSubstrate should calculate ingredients for a predefined mix", () => {
    const recipe = calculateSubstrate("masters-mix", 2000, 60);
    expect(recipe.name).toBe("Master's Mix");
    expect(recipe.totalWeight).toBeCloseTo(2000);
    expect(recipe.ingredients.length).toBeGreaterThan(0);
    const sawdust = recipe.ingredients.find((i) => i.name === "Hardwood sawdust");
    expect(sawdust).toBeDefined();
    expect(sawdust?.weightGrams).toBeCloseTo(977.3);
  });

  it("calculateSubstrate should use default moisture target if not provided", () => {
    const recipe = calculateSubstrate("hardwood-sawdust", 1000);
    expect(recipe.moistureTarget).toBe(SUBSTRATE_RECIPES["hardwood-sawdust"].defaultMoistureTarget);
  });

  it("calculateSubstrate should handle custom recipes", () => {
    const customMix = {
      name: "Custom Coco-Straw",
      ingredients: [
        { name: "Coco Coir", ratio: 0.6, moisturePercent: 15 },
        { name: "Straw", ratio: 0.4, moisturePercent: 8 },
      ],
      defaultMoistureTarget: 70,
    };
    const recipe = calculateSubstrate(customMix, 1500);
    expect(recipe.name).toBe("Custom Coco-Straw");
    expect(recipe.totalWeight).toBeCloseTo(1500);
    expect(recipe.moistureTarget).toBe(70);
    const coco = recipe.ingredients.find(i => i.name === "Coco Coir");
    expect(coco?.weightGrams).toBeCloseTo(600 * (1 - 0.7) / (1 - 0.15)); // dry mass / (1 - moisture)
  });

  it("calculateSubstrate should throw error for invalid custom recipe ratios", () => {
    const invalidMix = {
      name: "Bad Mix",
      ingredients: [
        { name: "A", ratio: 0.5, moisturePercent: 10 },
        { name: "B", ratio: 0.6, moisturePercent: 10 }, // Ratios sum to 1.1
      ],
      defaultMoistureTarget: 60,
    };
    expect(() => calculateSubstrate(invalidMix, 1000)).toThrow("Custom recipe ingredient ratios must sum to 1.");
  });

  it("calculateSubstrate should throw error for invalid custom recipe structure", () => {
    const invalidMix = { name: "Bad Mix", ingredients: [], defaultMoistureTarget: 60 };
    expect(() => calculateSubstrate(invalidMix as any, 1000)).toThrow("Invalid custom substrate recipe provided.");
  });
});

describe("timeline", () => {
  it("estimateTimeline should return a valid timeline for shiitake", () => {
    const timeline = estimateTimeline("shiitake");
    expect(timeline).toBeDefined();
    expect(timeline.species).toBe("Shiitake");
    expect(timeline.phases.length).toBe(5);
    expect(timeline.totalDays).toBeGreaterThan(0);
    expect(timeline.expectedYieldGrams).toBeGreaterThan(0);
  });

  it("estimateTimeline should return a valid timeline for oyster_blue", () => {
    const timeline = estimateTimeline("oyster_blue");
    expect(timeline).toBeDefined();
    expect(timeline.species).toBe("Blue Oyster");
    expect(timeline.phases.length).toBe(5);
    expect(timeline.totalDays).toBeGreaterThan(0);
  });

  it("estimateTimeline should use default timing for unknown species", () => {
    // Temporarily mock getSpeciesById to return a valid profile for an unknown ID
    const originalGetSpeciesById = getSpeciesById;
    const mockSpeciesProfile: SpeciesProfile = {
      commonName: "Unknown Mushroom",
      scientificName: "Fungus unknownus",
      incubation: { tempMin: 20, tempMax: 25, humidityMin: 70, humidityMax: 80, co2Max: 5000, faeMin: 1 },
      fruiting: { tempMin: 18, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Max: 800, faeMin: 4 },
    };
    // @ts-ignore
    global.getSpeciesById = (id: string) => {
      if (id === "unknown_species") return mockSpeciesProfile;
      return originalGetSpeciesById(id);
    };

    const timeline = estimateTimeline("unknown_species");
    expect(timeline.species).toBe("Unknown Mushroom");
    // Check if default timing values are used
    expect(timeline.phases[0].durationDays).toBe(1); // Default inoculation
    expect(timeline.phases[1].durationDays).toBe(21); // Default colonization

    // Restore original function
    // @ts-ignore
    global.getSpeciesById = originalGetSpeciesById;
  });

  it("estimateTimeline should calculate expected yield based on substrate weight", () => {
    const timeline = estimateTimeline("shiitake", 5000); // 5kg substrate
    expect(timeline.expectedYieldGrams).toBeCloseTo(5000 * 0.35 * (75 / 100));
  });

  it("estimateTimeline should throw error for non-existent species ID", () => {
    expect(() => estimateTimeline("non_existent_species")).toThrow("Species with ID 'non_existent_species' not found.");
  });
});
