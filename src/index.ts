import type {
  EnvironmentConditions,
  StageRanges,
  SpeciesProfile,
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
  ParameterAlert,
  AlertResult,
  ContaminationFactors,
  ContaminationRisk,
  ConditionCheck,
  SpeciesId,
  SpeciesDatabase,
};

export { AlertSeverity } from "./types.js";

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

export type { SubstrateIngredient, SubstrateRecipe, SubstrateMix } from "./substrate.js";
export {
  SUBSTRATE_RECIPES,
  calculateMoistureContent,
  calculateSubstrate,
} from "./substrate.js";

export type { GrowPhase, GrowTimeline } from "./timeline.js";
export { estimateTimeline } from "./timeline.js";
