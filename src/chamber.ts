import type { EnvironmentConditions, StageRanges, SpeciesProfile, ParameterAlert, AlertResult, ContaminationFactors, ContaminationRisk, ConditionCheck } from "./types.js";
import { AlertSeverity } from "./types.js";
import { isEnvironmentConditions, isSpeciesProfile } from "./validators.js";

/**
 * Configuration for alert severity thresholds.
 * Percentages represent how far outside the optimal range a value must be
 * to trigger each severity level.
 */
export interface AlertThresholds {
  /** Percentage deviation from optimal range to trigger warning (default: 10%). */
  readonly warningThresholdPercent: number;
  /** Percentage deviation from optimal range to trigger critical (default: 25%). */
  readonly criticalThresholdPercent: number;
}

/**
 * Default alert thresholds used when none are provided.
 */
export const DEFAULT_THRESHOLDS: AlertThresholds = {
  warningThresholdPercent: 10,
  criticalThresholdPercent: 25,
} as const;

/**
 * Error thrown when invalid input is provided to the calculator.
 */
export class ChamberCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChamberCalculationError";
  }
}

/**
 * Check environmental conditions against optimal ranges for a specific species and stage.
 * @param species - Mushroom species profile
 * @param stage - Growth stage ("incubation" or "fruiting")
 * @param conditions - Measured environmental readings
 * @param thresholds - Optional alert threshold configuration
 * @returns Complete condition check with alerts and contamination risk
 * @throws {ChamberCalculationError} If inputs are invalid
 * @example
 * const result = checkConditions(
 *   shiitakeProfile,
 *   "fruiting",
 *   { temperature: 24, humidity: 88, co2: 800, fae: 4 }
 * );
 */
export function checkConditions(
  species: SpeciesProfile,
  stage: "incubation" | "fruiting",
  conditions: EnvironmentConditions,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): ConditionCheck {
  // Validate inputs
  if (!isSpeciesProfile(species)) {
    throw new ChamberCalculationError("Invalid species profile");
  }

  if (stage !== "incubation" && stage !== "fruiting") {
    throw new ChamberCalculationError(`Invalid stage: ${stage}`);
  }

  if (!isEnvironmentConditions(conditions)) {
    throw new ChamberCalculationError(
      "Invalid environment conditions: temperature, humidity, CO2, or FAE values are invalid"
    );
  }

  if (thresholds.warningThresholdPercent <= 0 || thresholds.criticalThresholdPercent <= 0) {
    throw new ChamberCalculationError(
      "Threshold percentages must be positive"
    );
  }

  if (thresholds.warningThresholdPercent >= thresholds.criticalThresholdPercent) {
    throw new ChamberCalculationError(
      "Warning threshold must be less than critical threshold"
    );
  }

  const optimalRanges = stage === "incubation" ? species.incubation : species.fruiting;
  
  // Rest of the function remains unchanged...
  // [Previous implementation continues here]
}
