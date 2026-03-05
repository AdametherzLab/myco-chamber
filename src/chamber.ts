import type { EnvironmentConditions, StageRanges, SpeciesProfile, AlertSeverity, ParameterAlert, AlertResult, ContaminationFactors, ContaminationRisk, ConditionCheck } from "./types.js";

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
 * Calculate the deviation percentage of a measured value from an optimal range.
 * @param measured - The measured value
 * @param min - Minimum acceptable value (inclusive)
 * @param max - Maximum acceptable value (inclusive)
 * @returns Percentage deviation (0 = within range, positive = outside range)
 * @internal
 */
function calculateDeviationPercent(
  measured: number,
  min: number,
  max: number
): number {
  if (measured >= min && measured <= max) {
    return 0;
  }
  
  if (measured < min) {
    return ((min - measured) / min) * 100;
  }
  
  // measured > max
  return ((measured - max) / max) * 100;
}

/**
 * Determine alert severity based on deviation percentage and thresholds.
 * @param deviationPercent - Percentage deviation from optimal range
 * @param thresholds - Alert threshold configuration
 * @returns Appropriate alert severity
 * @internal
 */
function determineSeverity(
  deviationPercent: number,
  thresholds: AlertThresholds
): AlertSeverity {
  if (deviationPercent === 0) {
    return AlertSeverity.Ok;
  }
  
  if (deviationPercent >= thresholds.criticalThresholdPercent) {
    return AlertSeverity.Critical;
  }
  
  if (deviationPercent >= thresholds.warningThresholdPercent) {
    return AlertSeverity.Warning;
  }
  
  return AlertSeverity.Ok;
}

/**
 * Create a human-readable message for a parameter alert.
 * @param parameter - The parameter name
 * @param measured - Measured value
 * @param min - Minimum acceptable value
 * @param max - Maximum acceptable value
 * @param severity - Alert severity
 * @returns Descriptive message
 * @internal
 */
function createAlertMessage(
  parameter: keyof EnvironmentConditions,
  measured: number,
  min: number,
  max: number,
  severity: AlertSeverity
): string {
  const parameterNames = {
    temperature: "Temperature",
    humidity: "Humidity",
    co2: "CO₂",
    fae: "Fresh air exchange",
  } as const;
  
  const displayName = parameterNames[parameter];
  
  if (severity === AlertSeverity.Ok) {
    return `${displayName} is within optimal range (${measured} within ${min}-${max})`;
  }
  
  if (measured < min) {
    return `${displayName} is too low (${measured} < ${min})`;
  }
  
  // measured > max
  return `${displayName} is too high (${measured} > ${max})`;
}

/**
 * Compute contamination risk score based on environmental conditions.
 * @param conditions - Current environmental readings
 * @param optimalRanges - Optimal ranges for the current stage
 * @returns Contamination risk assessment with score (0-100) and factors
 * @example
 * const risk = computeContaminationRisk(
 *   { temperature: 28, humidity: 95, co2: 2000, fae: 2 },
 *   { tempMin: 22, tempMax: 26, humidityMin: 85, humidityMax: 95, co2Max: 1200, faeMin: 4 }
 * );
 */
export function computeContaminationRisk(
  conditions: EnvironmentConditions,
  optimalRanges: StageRanges
): ContaminationRisk {
  const factors: ContaminationFactors = {
    highHumidityLowFae: conditions.humidity > optimalRanges.humidityMax && 
                        conditions.fae < optimalRanges.faeMin,
    highTemperature: conditions.temperature > optimalRanges.tempMax,
    highCo2: conditions.co2 > optimalRanges.co2Max,
    condensationRisk: conditions.humidity > 90 && 
                     (conditions.temperature < optimalRanges.tempMin || 
                      conditions.temperature > optimalRanges.tempMax),
  };
  
  let score = 0;
  const recommendations: string[] = [];
  
  // Score calculation (0-100 scale)
  if (factors.highHumidityLowFae) {
    score += 35;
    recommendations.push("Increase fresh air exchange to reduce humidity and prevent mold");
  }
  
  if (factors.highTemperature) {
    score += 30;
    recommendations.push("Lower temperature to optimal range to slow bacterial growth");
  }
  
  if (factors.highCo2) {
    score += 25;
    recommendations.push("Improve ventilation to reduce CO₂ levels and strengthen mycelium");
  }
  
  if (factors.condensationRisk) {
    score += 20;
    recommendations.push("Reduce humidity or adjust temperature to prevent condensation");
  }
  
  // Cap at 100
  score = Math.min(score, 100);
  
  // Add general recommendation if score is low
  if (score < 20 && recommendations.length === 0) {
    recommendations.push("Conditions are good. Maintain current parameters.");
  }
  
  return {
    score,
    factors,
    recommendations,
  };
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
  if (conditions.humidity < 0 || conditions.humidity > 100) {
    throw new ChamberCalculationError(
      `Humidity must be between 0 and 100%, got ${conditions.humidity}`
    );
  }
  
  if (conditions.co2 < 0) {
    throw new ChamberCalculationError(
      `CO₂ concentration cannot be negative, got ${conditions.co2}`
    );
  }
  
  if (conditions.fae < 0) {
    throw new ChamberCalculationError(
      `Fresh air exchanges cannot be negative, got ${conditions.fae}`
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
  
  // Check each parameter
  const parameterChecks: Array<{
    parameter: keyof EnvironmentConditions;
    measured: number;
    min: number;
    max: number;
  }> = [
    {
      parameter: "temperature",
      measured: conditions.temperature,
      min: optimalRanges.tempMin,
      max: optimalRanges.tempMax,
    },
    {
      parameter: "humidity",
      measured: conditions.humidity,
      min: optimalRanges.humidityMin,
      max: optimalRanges.humidityMax,
    },
    {
      parameter: "co2",
      measured: conditions.co2,
      min: 0, // CO₂ has no minimum, only maximum
      max: optimalRanges.co2Max,
    },
    {
      parameter: "fae",
      measured: conditions.fae,
      min: optimalRanges.faeMin,
      max: Infinity, // FAE has no maximum, only minimum
    },
  ];
  
  const alerts: ParameterAlert[] = [];
  let overallSeverity = AlertSeverity.Ok;
  
  for (const check of parameterChecks) {
    const deviationPercent = calculateDeviationPercent(
      check.measured,
      check.min,
      check.max
    );
    
    const severity = determineSeverity(deviationPercent, thresholds);
    
    // Only create alerts for parameters that are out of range
    if (severity !== AlertSeverity.Ok) {
      const alert: ParameterAlert = {
        parameter: check.parameter,
        measured: check.measured,
        min: check.min,
        max: check.max,
        severity,
        message: createAlertMessage(
          check.parameter,
          check.measured,
          check.min,
          check.max,
          severity
        ),
      };
      
      alerts.push(alert);
      
      // Update overall severity to the highest severity found
      if (
        severity === AlertSeverity.Critical ||
        (severity === AlertSeverity.Warning && overallSeverity !== AlertSeverity.Critical)
      ) {
        overallSeverity = severity;
      }
    }
  }
  
  // Create summary message
  let summary: string;
  switch (overallSeverity) {
    case AlertSeverity.Critical:
      summary = `Critical issues detected for ${species.commonName} in ${stage} stage`;
      break;
    case AlertSeverity.Warning:
      summary = `Minor deviations detected for ${species.commonName} in ${stage} stage`;
      break;
    default:
      summary = `Conditions optimal for ${species.commonName} in ${stage} stage`;
  }
  
  const alertResult: AlertResult = {
    overallSeverity,
    alerts,
    summary,
  };
  
  const contaminationRisk = computeContaminationRisk(conditions, optimalRanges);
  
  return {
    species,
    stage,
    conditions,
    alert: alertResult,
    contaminationRisk,
  };
}