import type { StageRanges } from "./types.js";

/**
 * A single ingredient in a substrate recipe.
 */
export interface SubstrateIngredient {
  /** Name of the ingredient. */
  readonly name: string;
  /** Weight in grams. */
  readonly weightGrams: number;
  /** Moisture content as a percentage (0-100). */
  readonly moisturePercent: number;
}

/**
 * A complete substrate recipe with target moisture.
 */
export interface SubstrateRecipe {
  /** Human-readable name of the recipe. */
  readonly name: string;
  /** List of ingredients with weights and moisture content. */
  readonly ingredients: readonly SubstrateIngredient[];
  /** Total weight in grams (dry + water). */
  readonly totalWeight: number;
  /** Target moisture percentage (0-100). */
  readonly moistureTarget: number;
}

/**
 * Pre-defined substrate mix identifiers.
 */
export type SubstrateMix = "hardwood-sawdust" | "straw" | "coco-coir" | "masters-mix";

/**
 * Base ratios for pre-built substrate recipes.
 * Ratios are relative parts by dry weight.
 */
interface BaseRecipe {
  readonly name: string;
  readonly ingredients: readonly { name: string; ratio: number; moisturePercent: number }[];
  readonly defaultMoistureTarget: number;
}

const BASE_RECIPES: Record<SubstrateMix, BaseRecipe> = {
  "hardwood-sawdust": {
    name: "Hardwood Sawdust",
    ingredients: [
      { name: "Hardwood sawdust", ratio: 0.8, moisturePercent: 12 },
      { name: "Wheat bran", ratio: 0.2, moisturePercent: 10 },
    ],
    defaultMoistureTarget: 65,
  },
  straw: {
    name: "Pasteurized Straw",
    ingredients: [
      { name: "Chopped wheat straw", ratio: 0.9, moisturePercent: 8 },
      { name: "Gypsum", ratio: 0.1, moisturePercent: 0 },
    ],
    defaultMoistureTarget: 70,
  },
  "coco-coir": {
    name: "Coco Coir",
    ingredients: [
      { name: "Coco coir", ratio: 0.7, moisturePercent: 15 },
      { name: "Vermiculite", ratio: 0.2, moisturePercent: 0 },
      { name: "Gypsum", ratio: 0.1, moisturePercent: 0 },
    ],
    defaultMoistureTarget: 68,
  },
  "masters-mix": {
    name: "Master's Mix",
    ingredients: [
      { name: "Hardwood sawdust", ratio: 0.5, moisturePercent: 12 },
      { name: "Soy hull pellets", ratio: 0.5, moisturePercent: 10 },
    ],
    defaultMoistureTarget: 60,
  },
} as const;

/**
 * Pre-built substrate recipes (exported for reference).
 */
export const SUBSTRATE_RECIPES: Record<SubstrateMix, BaseRecipe> = BASE_RECIPES;

/**
 * Calculate the current moisture content of a list of ingredients.
 * @param ingredients - Array of substrate ingredients
 * @returns Weighted average moisture percentage (0-100)
 */
export function calculateMoistureContent(ingredients: readonly SubstrateIngredient[]): number {
  if (ingredients.length === 0) return 0;

  let totalWeight = 0;
  let totalWater = 0;

  for (const ing of ingredients) {
    totalWeight += ing.weightGrams;
    totalWater += ing.weightGrams * (ing.moisturePercent / 100);
  }

  if (totalWeight === 0) return 0;
  return (totalWater / totalWeight) * 100;
}

/**
 * Calculate a substrate recipe for a given mix type and target weight.
 * Returns the ingredient weights needed to reach the target total weight
 * at the desired moisture content.
 *
 * @param mix - Pre-defined substrate mix identifier
 * @param targetWeightGrams - Desired total weight in grams (wet weight)
 * @param moistureTarget - Optional target moisture percentage (uses recipe default if omitted)
 * @returns Complete substrate recipe with calculated ingredient weights
 */
export function calculateSubstrate(
  mix: SubstrateMix,
  targetWeightGrams: number,
  moistureTarget?: number
): SubstrateRecipe {
  const base = BASE_RECIPES[mix];
  const target = moistureTarget ?? base.defaultMoistureTarget;

  // Calculate dry mass needed: totalWeight = dryMass + waterMass
  // target% = waterMass / totalWeight * 100
  // waterMass = totalWeight * target / 100
  // dryMass = totalWeight - waterMass = totalWeight * (1 - target/100)
  const dryMass = targetWeightGrams * (1 - target / 100);

  const ingredients: SubstrateIngredient[] = base.ingredients.map(ing => {
    // Each ingredient's dry contribution
    const dryWeight = dryMass * ing.ratio;
    // Actual weight considering ingredient already has some moisture
    // dryWeight = actualWeight * (1 - moisturePercent/100)
    const actualWeight = ing.moisturePercent > 0
      ? dryWeight / (1 - ing.moisturePercent / 100)
      : dryWeight;

    return {
      name: ing.name,
      weightGrams: Math.round(actualWeight * 10) / 10,
      moisturePercent: ing.moisturePercent,
    };
  });

  // Water to add = totalWeight - sum of ingredient weights
  const ingredientWeight = ingredients.reduce((sum, i) => sum + i.weightGrams, 0);
  const waterToAdd = Math.max(0, targetWeightGrams - ingredientWeight);

  if (waterToAdd > 0) {
    ingredients.push({
      name: "Water",
      weightGrams: Math.round(waterToAdd * 10) / 10,
      moisturePercent: 100,
    });
  }

  const actualTotal = ingredients.reduce((sum, i) => sum + i.weightGrams, 0);

  return {
    name: base.name,
    ingredients,
    totalWeight: Math.round(actualTotal * 10) / 10,
    moistureTarget: target,
  };
}
