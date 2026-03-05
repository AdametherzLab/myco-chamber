# myco-chamber 🍄

[![CI](https://github.com/AdametherzLab/myco-chamber/actions/workflows/ci.yml/badge.svg)](https://github.com/AdametherzLab/myco-chamber/actions) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Professional-grade mushroom grow chamber calculator** — compute optimal temperature, humidity, CO₂, and FAE for 30+ mushroom species with fruiting condition alerts and contamination risk scoring.

## ✨ Features

✅ **30+ species profiles** — shiitake, oyster varieties, lion's mane, reishi, and more  
✅ **Stage-specific optimization** — separate ranges for incubation and fruiting stages  
✅ **Smart alerts** — configurable severity levels for environmental deviations  
✅ **Contamination risk scoring** — predictive modeling based on real-world data  
✅ **Zero dependencies** — pure TypeScript with Node.js/Bun built-ins only  
✅ **Production-ready** — strict TypeScript, comprehensive error handling, MIT licensed  

## 📦 Installation

```bash
# npm
npm install @adametherzlab/myco-chamber

# yarn
yarn add @adametherzlab/myco-chamber

# bun
bun add @adametherzlab/myco-chamber

# pnpm
pnpm add @adametherzlab/myco-chamber
```

## 🚀 Quick Start

```typescript
// REMOVED external import: import { getSpeciesById, checkConditions } from "@adametherzlab/myco-chamber";

// Get shiitake mushroom profile
const shiitake = getSpeciesById("shiitake");

// Check current fruiting conditions
const result = checkConditions(
  shiitake,
  "fruiting",
  {
    temperature: 24.5,    // °C
    humidity: 88,         // %
    co2: 750,             // ppm
    fae: 4                // air exchanges per hour
  }
);

console.log(`Contamination risk: ${result.contaminationRisk.score}%`);
console.log(`Alerts: ${result.alerts.parameterAlerts.length}`);
```

## 📚 API Reference

### Core Functions

#### `getSpeciesById(id: string): SpeciesProfile`
```typescript
const lionMane = getSpeciesById("lions_mane");
console.log(lionMane.commonName); // "Lion's Mane"
```

#### `getAllSpecies(): readonly SpeciesProfile[]`
Get all 30+ species profiles in the database.

```typescript
const allSpecies = getAllSpecies();
allSpecies.forEach(species => console.log(species.commonName));
```

#### `searchSpeciesByName(query: string): readonly SpeciesProfile[]`
```typescript
const oysters = searchSpeciesByName("oyster");
// Returns blue, pink, yellow, king, and phoenix oyster profiles
```

#### `getSpeciesByStageConditions(stage: "incubation" | "fruiting", conditions: EnvironmentConditions): readonly SpeciesProfile[]`
Filter species by stage-specific environmental conditions.

```typescript
const suitableSpecies = getSpeciesByStageConditions("fruiting", {
  temperature: 20,
  humidity: 85,
  co2: 600,
  fae: 3
});
```

#### `checkConditions(species: SpeciesProfile, stage: "incubation" | "fruiting", conditions: EnvironmentConditions, thresholds?: AlertThresholds): ConditionCheck`
```typescript
const check = checkConditions(
  speciesProfile,
  "incubation",
  currentReadings,
  { warning: 10, critical: 25 } // optional custom thresholds
);
```

#### `computeContaminationRisk(conditions: EnvironmentConditions, optimalRanges: StageRanges): ContaminationRisk`
Compute contamination risk score (0-100) based on environmental conditions.

```typescript
const risk = computeContaminationRisk(
  { temperature: 28, humidity: 95, co2: 2000, fae: 2 },
  optimalRanges
);
```

### Type Definitions

#### `EnvironmentConditions`
- `temperature: number` — Celsius (°C)
- `humidity: number` — Percentage (%)
- `co2: number` — Parts per million (ppm)
- `fae: number` — Air exchanges per hour

#### `SpeciesProfile`
- `id: SpeciesId` — Unique identifier (e.g., "shiitake")
- `commonName: string` — Common name (e.g., "Shiitake")
- `scientificName: string` — Scientific name (e.g., "Lentinula edodes")
- `incubation: StageRanges` — Optimal ranges for incubation stage
- `fruiting: StageRanges` — Optimal ranges for fruiting stage

#### `StageRanges`
- `tempMin: number` — Minimum temperature (°C)
- `tempMax: number` — Maximum temperature (°C)
- `humidityMin: number` — Minimum humidity (%)
- `humidityMax: number` — Maximum humidity (%)
- `co2Max: number` — Maximum CO₂ (ppm)
- `faeMin: number` — Minimum air exchanges per hour

#### `ConditionCheck`
- `alerts: AlertResult` — All parameter alerts
- `contaminationRisk: ContaminationRisk` — Risk assessment
- `withinOptimalRange: boolean` — Whether all parameters are optimal

#### `AlertSeverity`
Severity level enum: `"optimal" | "warning" | "critical"`

#### `ContaminationRisk`
Risk assessment with:
- `score: number` — 0-100 risk percentage
- `factors: ContaminationFactors` — Contributing factors
- `recommendations: readonly string[]` — Mitigation suggestions

## 🍄 Supported Species (30+)

**Popular Cultivars:** Shiitake, Lion's Mane, Reishi, Turkey Tail, Maitake  
**Oyster Varieties:** Blue, Pink, Yellow, King, Phoenix, Pearl, Golden  
**Medicinal Species:** Cordyceps militaris, Chaga, Agaricus blazei  
**Gourmet Species:** Morel, Enoki, Nameko, Pioppino, Chestnut, Wine Cap  
**Tropical Species:** Tropical Oyster, Shaggy Mane, Wood Ear  
**And more...** (Full list in species database)

## 🧪 Advanced Usage

### Complete Grow Chamber Monitoring

```typescript
import {
  getSpeciesById,
  checkConditions,
  computeContaminationRisk,
  type EnvironmentConditions,
  type ConditionCheck
} from "@adametherzlab/myco-chamber";

class GrowChamberMonitor {
  private species = getSpeciesById("blue_oyster");
  private stage: "incubation" | "fruiting" = "fruiting";
  
  checkEnvironment(sensorReadings: EnvironmentConditions): ConditionCheck {
    const result = checkConditions(this.species, this.stage, sensorReadings);
    
    if (result.contaminationRisk.score > 70) {
      console.warn("⚠️ High contamination risk detected!");
      result.contaminationRisk.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
    
    result.alerts.parameterAlerts.forEach(alert => {
      if (alert.severity === "critical") {
        console.error(`🚨 Critical: ${alert.parameter} is ${alert.deviation}% outside optimal range`);
      }
    });
    
    return result;
  }
  
  findOptimalSpecies(conditions: EnvironmentConditions) {
    return getSpeciesByStageConditions(this.stage, conditions);
  }
}

// Usage
const monitor = new GrowChamberMonitor();
const sensorData: EnvironmentConditions = {
  temperature: 22.5,
  humidity: 92,
  co2: 1200,
  fae: 3
};

const analysis = monitor.checkEnvironment(sensorData);
console.log(`Overall status: ${analysis.withinOptimalRange ? "✅ Optimal" : "⚠️ Needs adjustment"}`);
```

### Alert Severity Levels

- **Optimal** (green): Within ±5% of optimal range (configurable)
- **Warning** (yellow): 5-15% outside optimal range
- **Critical** (red): >15% outside optimal range

### Contamination Risk Scoring

The contamination risk score (0-100%) is calculated using weighted factors:

1. **Temperature deviation** (30% weight) — High temps promote bacterial growth
2. **Humidity excess** (25% weight) — Standing water encourages mold
3. **CO₂ accumulation** (20% weight) — Stagnant air fosters contaminants
4. **Insufficient FAE** (15% weight) — Poor gas exchange stresses mycelium
5. **Combined stress** (10% weight) — Multiple suboptimal parameters

Scores below 30% are considered low risk, 30-70% moderate risk, and above 70% high risk.

## 🤝 Contributing

## 📄 License

MIT © [AdametherzLab](https://github.com/AdametherzLab)

---

**Happy growing!** 🍄 If you use myco-chamber in your project, we'd love to hear about it. Share your setup, improvements, or feature requests in the GitHub repository.