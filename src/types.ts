/**
 * Represents a single reading of environmental conditions.
 * All values are in standard units: Celsius, percentage, ppm, and air exchanges per hour.
 */
export interface EnvironmentConditions {
  /** Temperature in degrees Celsius. */
  readonly temperature: number;
  /** Relative humidity as a percentage (0-100). */
  readonly humidity: number;
  /** Carbon dioxide concentration in parts per million. */
  readonly co2: number;
  /** Fresh air exchanges per hour. */
  readonly fae: number;
}

/**
 * Optimal environmental ranges for a mushroom species during a specific growth stage.
 */
export interface StageRanges {
  /** Minimum acceptable temperature in Celsius. */
  readonly tempMin: number;
  /** Maximum acceptable temperature in Celsius. */
  readonly tempMax: number;
  /** Minimum acceptable relative humidity (0-100). */
  readonly humidityMin: number;
  /** Maximum acceptable relative humidity (0-100). */
  readonly humidityMax: number;
  /** Maximum acceptable CO2 concentration in ppm. */
  readonly co2Max: number;
  /** Minimum acceptable fresh air exchanges per hour. */
  readonly faeMin: number;
}

/**
 * Complete environmental profile for a mushroom species across all growth stages.
 */
export interface SpeciesProfile {
  /** Common name of the mushroom species (e.g., "Shiitake"). */
  readonly commonName: string;
  /** Scientific name (genus and species). */
  readonly scientificName: string;
  /** Optimal conditions for the incubation/mycelial colonization stage. */
  readonly incubation: StageRanges;
  /** Optimal conditions for the fruiting/pinning stage. */
  readonly fruiting: StageRanges;
  /** Additional notes or special requirements. */
  readonly notes?: string;
}

/**
 * Severity level of an environmental deviation alert.
 */
export enum AlertSeverity {
  /** Conditions are within optimal range. */
  Ok = "ok",
  /** Minor deviation that may slow growth. */
  Warning = "warning",
  /** Major deviation that can cause growth failure or contamination. */
  Critical = "critical",
}

/**
 * Describes a single environmental parameter deviation from optimal range.
 */
export interface ParameterAlert {
  /** The parameter that is out of range (e.g., "temperature"). */
  readonly parameter: keyof EnvironmentConditions;
  /** The measured value. */
  readonly measured: number;
  /** The minimum acceptable value for this parameter (inclusive). */
  readonly min: number;
  /** The maximum acceptable value for this parameter (inclusive). */
  readonly max: number;
  /** Severity of this specific deviation. */
  readonly severity: AlertSeverity;
  /** Human-readable description of the issue. */
  readonly message: string;
}

/**
 * Combined alert result for all environmental parameters.
 */
export interface AlertResult {
  /** Overall severity (highest severity among all parameters). */
  readonly overallSeverity: AlertSeverity;
  /** Individual alerts for each out-of-range parameter. */
  readonly alerts: readonly ParameterAlert[];
  /** Summary message for the overall condition. */
  readonly summary: string;
}

/**
 * Factors contributing to contamination risk.
 */
export interface ContaminationFactors {
  /** High humidity combined with poor air exchange increases mold risk. */
  readonly highHumidityLowFae: boolean;
  /** Temperature above optimal range favors bacterial growth. */
  readonly highTemperature: boolean;
  /** CO2 buildup can weaken mycelium and invite contaminants. */
  readonly highCo2: boolean;
  /** Condensation on surfaces indicates excessive humidity. */
  readonly condensationRisk: boolean;
}

/**
 * Contamination risk assessment with recommendations.
 */
export interface ContaminationRisk {
  /** Risk score from 0 (no risk) to 10 (extreme risk). */
  readonly score: number;
  /** Factors that contributed to the risk score. */
  readonly factors: ContaminationFactors;
  /** Recommended actions to reduce risk. */
  readonly recommendations: readonly string[];
}

/**
 * Combined output of environmental check, including alerts and contamination risk.
 */
export interface ConditionCheck {
  /** The species profile used for the check. */
  readonly species: SpeciesProfile;
  /** The growth stage that was evaluated. */
  readonly stage: "incubation" | "fruiting";
  /** The measured environmental conditions. */
  readonly conditions: EnvironmentConditions;
  /** Alert results for deviations from optimal ranges. */
  readonly alert: AlertResult;
  /** Contamination risk assessment. */
  readonly contaminationRisk: ContaminationRisk;
}

/**
 * Branded type for a valid species identifier (slug format).
 */
export type SpeciesId = string & { readonly __brand: "SpeciesId" };

/**
 * Database of all available mushroom species profiles.
 */
export type SpeciesDatabase = Readonly<Record<SpeciesId, SpeciesProfile>>;

export type {
  SubstrateIngredient,
  SubstrateRecipe,
  CustomSubstrateRecipeInput,
} from './substrate.js';
