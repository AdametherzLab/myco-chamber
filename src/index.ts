import type {
  EnvironmentConditions,
  StageRanges,
  SpeciesProfile,
  AlertSeverity,
  ParameterAlert,
  AlertResult,
  ContaminationFactors,
  ContaminationRisk,
  ConditionCheck,
  SpeciesId,
  SpeciesDatabase,
} from "./types.js";

export type {
  EnvironmentConditions,
  StageRanges,
  SpeciesProfile,
  AlertSeverity,
  ParameterAlert,
  AlertResult,
  ContaminationFactors,
  ContaminationRisk,
  ConditionCheck,
  SpeciesId,
  SpeciesDatabase,
};

export {
  getSpeciesById,
  getAllSpecies,
  searchSpeciesByName,
  getSpeciesByStageConditions,
} from "./species-db.js";

export type { AlertThresholds } from "./chamber.js";
export {
  DEFAULT_THRESHOLDS,
  ChamberCalculationError,
  computeContaminationRisk,
  checkConditions,
} from "./chamber.js";