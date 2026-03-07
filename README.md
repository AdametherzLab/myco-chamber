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
- **Input validation** -- Runtime type guards for EnvironmentConditions, StageRanges, and SpeciesProfile
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
  isEnvironmentConditions,
  isSpeciesProfile,
  calculateSubstrate,
  estimateTimeline,
} from "@adametherzlab/myco-chamber";

// Validate user input
const userConditions = { temperature: 22, humidity: 85, co2: 500, fae: 4 };
if (!isEnvironmentConditions(userConditions)) {
  throw new Error("Invalid environment conditions");
}

// Get a species profile
const shiitake = getSpeciesById("shiitake");
if (!isSpeciesProfile(shiitake)) {
  throw new Error("Invalid species profile");
}

// Check current fruiting conditions
const result = checkConditions(shiitake, "fruiting", userConditions);
console.log(result.alert.overallSeverity); // "ok"
console.log(`Contamination risk: ${result.contaminationRisk.score}`);

// Calculate a substrate recipe
const recipe = calculateSubstrate("masters-mix", 2000);
console.log(`Mix ${recipe.ingredients.map(i => i.name).join(" and ")}`);

// Estimate grow timeline
const timeline = estimateTimeline("shiitake");
console.log(`Harvest in ${timeline.totalDays} days`);
```
