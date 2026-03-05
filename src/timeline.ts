import type { StageRanges, SpeciesProfile } from "./types.js";
import { getSpeciesById } from "./species-db.js";

/**
 * A single phase in the mushroom grow timeline.
 */
export interface GrowPhase {
  /** Name of the growth phase. */
  readonly phase: string;
  /** Estimated duration in days. */
  readonly durationDays: number;
  /** Optimal environmental conditions for this phase. */
  readonly conditions: StageRanges;
  /** Additional guidance for this phase. */
  readonly notes: string;
}

/**
 * Complete grow timeline from inoculation to harvest.
 */
export interface GrowTimeline {
  /** Species common name. */
  readonly species: string;
  /** Ordered list of growth phases. */
  readonly phases: readonly GrowPhase[];
  /** Total estimated days from inoculation to harvest. */
  readonly totalDays: number;
  /** Expected yield in grams (based on substrate weight, default 2000g). */
  readonly expectedYieldGrams: number;
}

/**
 * Species-specific timing data for grow phases (in days).
 * Keyed by species ID. Falls back to defaults if not listed.
 */
const SPECIES_TIMINGS: Record<string, {
  inoculation: number;
  colonization: number;
  primordia: number;
  fruiting: number;
  yieldPercent: number; // biological efficiency as % of dry substrate
}> = {
  shiitake:           { inoculation: 1, colonization: 60, primordia: 7,  fruiting: 14, yieldPercent: 75 },
  oyster_blue:        { inoculation: 1, colonization: 14, primordia: 5,  fruiting: 7,  yieldPercent: 100 },
  oyster_king:        { inoculation: 1, colonization: 21, primordia: 7,  fruiting: 10, yieldPercent: 70 },
  oyster_pink:        { inoculation: 1, colonization: 10, primordia: 4,  fruiting: 6,  yieldPercent: 90 },
  oyster_golden:      { inoculation: 1, colonization: 12, primordia: 5,  fruiting: 7,  yieldPercent: 85 },
  oyster_phoenix:     { inoculation: 1, colonization: 14, primordia: 5,  fruiting: 7,  yieldPercent: 90 },
  oyster_pearl:       { inoculation: 1, colonization: 14, primordia: 5,  fruiting: 7,  yieldPercent: 95 },
  lions_mane:         { inoculation: 1, colonization: 21, primordia: 7,  fruiting: 10, yieldPercent: 60 },
  reishi:             { inoculation: 1, colonization: 30, primordia: 10, fruiting: 30, yieldPercent: 40 },
  maitake:            { inoculation: 1, colonization: 40, primordia: 10, fruiting: 14, yieldPercent: 50 },
  enoki:              { inoculation: 1, colonization: 21, primordia: 7,  fruiting: 14, yieldPercent: 65 },
  chestnut:           { inoculation: 1, colonization: 28, primordia: 7,  fruiting: 10, yieldPercent: 55 },
  nameko:             { inoculation: 1, colonization: 28, primordia: 7,  fruiting: 10, yieldPercent: 60 },
  wine_cap:           { inoculation: 1, colonization: 21, primordia: 7,  fruiting: 10, yieldPercent: 80 },
  pioppino:           { inoculation: 1, colonization: 21, primordia: 7,  fruiting: 10, yieldPercent: 60 },
  turkey_tail:        { inoculation: 1, colonization: 30, primordia: 10, fruiting: 21, yieldPercent: 30 },
  cordyceps:          { inoculation: 1, colonization: 14, primordia: 7,  fruiting: 21, yieldPercent: 20 },
  button_mushroom:    { inoculation: 1, colonization: 14, primordia: 7,  fruiting: 10, yieldPercent: 60 },
  shimeji:            { inoculation: 1, colonization: 28, primordia: 7,  fruiting: 10, yieldPercent: 55 },
};

const DEFAULT_TIMING = { inoculation: 1, colonization: 21, primordia: 7, fruiting: 14, yieldPercent: 50 };

/**
 * Estimate a complete grow timeline for a mushroom species.
 *
 * @param speciesId - Species identifier (e.g., "shiitake", "oyster_blue")
 * @param substrateWeightGrams - Total wet substrate weight in grams (default: 2000)
 * @returns Full grow timeline with phases, durations, and expected yield
 * @throws {RangeError} If species ID is not found
 */
export function estimateTimeline(speciesId: string, substrateWeightGrams = 2000): GrowTimeline {
  const species = getSpeciesById(speciesId);
  const timing = SPECIES_TIMINGS[speciesId] ?? DEFAULT_TIMING;

  // Assume ~35% of wet substrate is dry weight for yield calc
  const drySubstrate = substrateWeightGrams * 0.35;
  const expectedYieldGrams = Math.round(drySubstrate * (timing.yieldPercent / 100));

  const phases: GrowPhase[] = [
    {
      phase: "Inoculation",
      durationDays: timing.inoculation,
      conditions: species.incubation,
      notes: "Introduce spawn to substrate under sterile conditions.",
    },
    {
      phase: "Colonization",
      durationDays: timing.colonization,
      conditions: species.incubation,
      notes: "Mycelium colonizes the substrate. Keep in dark, stable conditions.",
    },
    {
      phase: "Primordia Formation",
      durationDays: timing.primordia,
      conditions: species.fruiting,
      notes: "Introduce fruiting conditions to trigger pinning.",
    },
    {
      phase: "Fruiting",
      durationDays: timing.fruiting,
      conditions: species.fruiting,
      notes: "Maintain fruiting conditions until harvest maturity.",
    },
    {
      phase: "Harvest",
      durationDays: 1,
      conditions: species.fruiting,
      notes: "Harvest before spore release. Cut at base of stem cluster.",
    },
  ];

  const totalDays = phases.reduce((sum, p) => sum + p.durationDays, 0);

  return {
    species: species.commonName,
    phases,
    totalDays,
    expectedYieldGrams,
  };
}
