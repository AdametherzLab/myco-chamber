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
  ChamberCalculationError,
  type SpeciesProfile,
  type EnvironmentConditions,
  type AlertResult,
  type ContaminationRisk,
  type SubstrateIngredient,
} from "../src/index.ts";

// ─── Species Database ────────────────────────────────────────────────

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

  it("getSpeciesByStageConditions filters by temperature", () => {
    const results = getSpeciesByStageConditions("fruiting", { temperature: 18 });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(s.fruiting.tempMin).toBeLessThanOrEqual(18);
      expect(s.fruiting.tempMax).toBeGreaterThanOrEqual(18);
    });
  });

  it("getSpeciesByStageConditions filters by humidity", () => {
    const results = getSpeciesByStageConditions("incubation", { humidity: 75 });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(s.incubation.humidityMin).toBeLessThanOrEqual(75);
      expect(s.incubation.humidityMax).toBeGreaterThanOrEqual(75);
    });
  });

  it("checkConditions throws for invalid humidity", () => {
    const species = getSpeciesById("shiitake");
    expect(() =>
      checkConditions(species, "fruiting", { temperature: 20, humidity: 110, co2: 500, fae: 4 })
    ).toThrow(ChamberCalculationError);
  });

  it("checkConditions throws for negative CO2", () => {
    const species = getSpeciesById("shiitake");
    expect(() =>
      checkConditions(species, "fruiting", { temperature: 20, humidity: 85, co2: -100, fae: 4 })
    ).toThrow(ChamberCalculationError);
  });

  it("computeContaminationRisk returns low score for optimal conditions", () => {
    const species = getSpeciesById("oyster_blue");
    const risk = computeContaminationRisk(
      { temperature: 18, humidity: 90, co2: 400, fae: 8 },
      species.fruiting
    );
    expect(risk.score).toBeLessThan(20);
    expect(risk.recommendations.length).toBeGreaterThan(0);
  });

  it("computeContaminationRisk returns high score for bad conditions", () => {
    const species = getSpeciesById("oyster_blue");
    const risk = computeContaminationRisk(
      { temperature: 35, humidity: 99, co2: 3000, fae: 1 },
      species.fruiting
    );
    expect(risk.score).toBeGreaterThan(50);
    expect(risk.factors.highTemperature).toBe(true);
    expect(risk.factors.highCo2).toBe(true);
  });
});

// ─── Substrate Calculator ────────────────────────────────────────────

describe("substrate calculator", () => {
  it("calculateSubstrate returns master's mix recipe with correct structure", () => {
    const recipe = calculateSubstrate("masters-mix", 2000);
    expect(recipe.name).toBe("Master's Mix");
    expect(recipe.ingredients.length).toBeGreaterThanOrEqual(2);
    expect(recipe.moistureTarget).toBe(60);
    expect(recipe.totalWeight).toBeCloseTo(2000, -1);
  });

  it("calculateSubstrate returns straw recipe", () => {
    const recipe = calculateSubstrate("straw", 3000);
    expect(recipe.name).toBe("Pasteurized Straw");
    expect(recipe.moistureTarget).toBe(70);
    expect(recipe.totalWeight).toBeCloseTo(3000, -1);
  });

  it("calculateSubstrate uses custom moisture target", () => {
    const recipe = calculateSubstrate("hardwood-sawdust", 1000, 55);
    expect(recipe.moistureTarget).toBe(55);
    expect(recipe.totalWeight).toBeCloseTo(1000, -1);
  });

  it("calculateSubstrate includes water ingredient when needed", () => {
    const recipe = calculateSubstrate("coco-coir", 2000);
    const water = recipe.ingredients.find((i) => i.name === "Water");
    expect(water).toBeDefined();
    expect(water!.weightGrams).toBeGreaterThan(0);
  });

  it("calculateMoistureContent returns correct weighted average", () => {
    const ingredients: SubstrateIngredient[] = [
      { name: "Sawdust", weightGrams: 800, moisturePercent: 12 },
      { name: "Bran", weightGrams: 200, moisturePercent: 10 },
    ];
    const moisture = calculateMoistureContent(ingredients);
    // (800*0.12 + 200*0.10) / 1000 * 100 = (96+20)/1000*100 = 11.6%
    expect(moisture).toBeCloseTo(11.6, 1);
  });

  it("calculateMoistureContent handles empty array", () => {
    expect(calculateMoistureContent([])).toBe(0);
  });

  it("calculateMoistureContent handles pure water", () => {
    const ingredients: SubstrateIngredient[] = [
      { name: "Water", weightGrams: 500, moisturePercent: 100 },
    ];
    expect(calculateMoistureContent(ingredients)).toBe(100);
  });

  it("SUBSTRATE_RECIPES has all 4 pre-built recipes", () => {
    expect(Object.keys(SUBSTRATE_RECIPES)).toEqual(
      expect.arrayContaining(["hardwood-sawdust", "straw", "coco-coir", "masters-mix"])
    );
    expect(Object.keys(SUBSTRATE_RECIPES).length).toBe(4);
  });
});

// ─── Grow Timeline ───────────────────────────────────────────────────

describe("grow timeline estimator", () => {
  it("estimateTimeline returns shiitake timeline with correct phases", () => {
    const timeline = estimateTimeline("shiitake");
    expect(timeline.species).toBe("Shiitake");
    expect(timeline.phases.length).toBe(5);
    expect(timeline.phases[0]!.phase).toBe("Inoculation");
    expect(timeline.phases[4]!.phase).toBe("Harvest");
  });

  it("estimateTimeline returns oyster_blue timeline with fast colonization", () => {
    const timeline = estimateTimeline("oyster_blue");
    expect(timeline.species).toBe("Blue Oyster");
    const colonization = timeline.phases.find((p) => p.phase === "Colonization");
    expect(colonization).toBeDefined();
    expect(colonization!.durationDays).toBeLessThanOrEqual(21);
  });

  it("estimateTimeline totalDays equals sum of phase durations", () => {
    const timeline = estimateTimeline("lions_mane");
    const sumDays = timeline.phases.reduce((s, p) => s + p.durationDays, 0);
    expect(timeline.totalDays).toBe(sumDays);
  });

  it("estimateTimeline phases count is always 5", () => {
    for (const id of ["shiitake", "reishi", "enoki", "oyster_pink"]) {
      const timeline = estimateTimeline(id);
      expect(timeline.phases.length).toBe(5);
    }
  });

  it("estimateTimeline calculates yield based on substrate weight", () => {
    const small = estimateTimeline("oyster_blue", 1000);
    const large = estimateTimeline("oyster_blue", 5000);
    expect(large.expectedYieldGrams).toBeGreaterThan(small.expectedYieldGrams);
  });

  it("estimateTimeline throws for unknown species", () => {
    expect(() => estimateTimeline("nonexistent_xyz")).toThrow(RangeError);
  });
});
