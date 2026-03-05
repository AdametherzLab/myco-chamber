# myco-chamber

[![CI](https://github.com/AdametherzLab/myco-chamber/actions/workflows/ci.yml/badge.svg)](https://github.com/AdametherzLab/myco-chamber/actions) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Professional-grade mushroom grow chamber calculator** -- compute optimal temperature, humidity, CO2, and FAE for 30+ mushroom species with fruiting condition alerts, contamination risk scoring, substrate recipes, and grow timelines.

## Features

- **30+ species profiles** -- shiitake, oyster varieties, lion's mane, reishi, cordyceps, and more
- **Stage-specific optimization** -- separate ranges for incubation and fruiting stages
- **Smart alerts** -- configurable severity levels for environmental deviations
- **Contamination risk scoring** -- predictive modeling based on real-world data
- **Substrate calculator** -- 4 pre-built recipes (master's mix, straw, coco coir, hardwood sawdust)
- **Grow timeline estimator** -- inoculation to harvest with expected yield calculations
- **Zero dependencies** -- pure TypeScript with Node.js/Bun built-ins only
- **Production-ready** -- strict TypeScript, comprehensive error handling, MIT licensed

## Installation

```bash
npm install @adametherzlab/myco-chamber
# or
bun add @adametherzlab/myco-chamber
```

## Quick Start

```typescript
import {
  getSpeciesById,
  checkConditions,
  calculateSubstrate,
  estimateTimeline,
} from "@adametherzlab/myco-chamber";

// Get a species profile
const shiitake = getSpeciesById("shiitake");
console.log(shiitake.commonName); // "Shiitake"

// Check current fruiting conditions
const result = checkConditions(shiitake, "fruiting", {
  temperature: 16,
  humidity: 88,
  co2: 750,
  fae: 5,
});
console.log(result.alert.overallSeverity); // "ok"
console.log(`Contamination risk: ${result.contaminationRisk.score}`);

// Calculate a substrate recipe
const recipe = calculateSubstrate("masters-mix", 2000);
console.log(recipe.ingredients);

// Estimate grow timeline
const timeline = estimateTimeline("shiitake", 2000);
console.log(`Total days: ${timeline.totalDays}`);
console.log(`Expected yield: ${timeline.expectedYieldGrams}g`);
```

## API Reference

### Species Database

#### `getAllSpecies(): SpeciesEntry[]`
Returns all 30+ species profiles.

#### `getSpeciesById(id: string): SpeciesEntry`
Look up a species by slug ID (e.g., `"shiitake"`, `"oyster_blue"`, `"lions_mane"`). Throws `RangeError` for unknown IDs.

#### `searchSpeciesByName(query: string): SpeciesEntry[]`
Search by partial common or scientific name.

```typescript
const oysters = searchSpeciesByName("oyster");
// Returns blue, pink, golden, king, phoenix, and pearl oyster profiles
```

#### `getSpeciesByStageConditions(stage, conditions): SpeciesEntry[]`
Filter species compatible with given temperature and/or humidity.

```typescript
const coldFruiters = getSpeciesByStageConditions("fruiting", { temperature: 12 });
```

### Condition Checker

#### `checkConditions(species, stage, conditions, thresholds?): ConditionCheck`
Check environmental readings against optimal ranges. Returns alerts and contamination risk.

#### `computeContaminationRisk(conditions, optimalRanges): ContaminationRisk`
Standalone contamination risk score (0-100) with contributing factors and recommendations.

### Substrate Calculator

#### `calculateSubstrate(mix, targetWeightGrams, moistureTarget?): SubstrateRecipe`
Calculate ingredient weights for a target total weight. Pre-built mixes: `"masters-mix"`, `"hardwood-sawdust"`, `"straw"`, `"coco-coir"`.

#### `calculateMoistureContent(ingredients): number`
Calculate weighted average moisture percentage from ingredient list.

#### `SUBSTRATE_RECIPES`
Reference object with base ratios for all 4 pre-built recipes.

### Grow Timeline

#### `estimateTimeline(speciesId, substrateWeightGrams?): GrowTimeline`
Estimate full grow timeline from inoculation to harvest. Returns phases, total days, and expected yield in grams.

```typescript
const timeline = estimateTimeline("oyster_blue", 3000);
// timeline.phases: Inoculation -> Colonization -> Primordia Formation -> Fruiting -> Harvest
// timeline.totalDays: 28
// timeline.expectedYieldGrams: 1050
```

## Supported Species (30+)

**Popular Cultivars:** Shiitake, Lion's Mane, Reishi, Turkey Tail, Maitake
**Oyster Varieties:** Blue, Pink, Golden, King, Phoenix, Pearl
**Medicinal Species:** Cordyceps militaris, Chaga, Almond Portobello
**Gourmet Species:** Morel, Enoki, Nameko, Pioppino, Chestnut, Wine Cap
**Others:** Button Mushroom, Shimeji, Wood Ear, Blewit, Brick Top, Parasol, and more

## License

MIT (c) [AdametherzLab](https://github.com/AdametherzLab)
