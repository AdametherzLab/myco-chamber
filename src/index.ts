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
} from "./species-db.js";

export {
  isEnvironmentConditions,
  isStageRanges,
  isSpeciesProfile,
} from "./validators.js";

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

export type { CustomSpeciesEntry, CustomSpeciesStore, CustomSpeciesStoreOptions } from "./custom-species.js";
export { createCustomSpeciesStore, CustomSpeciesError, exportProfile, importProfile } from "./custom-species.js";

export type { CustomSpeciesUIOptions } from "./custom-species-ui.js";
export { createCustomSpeciesUI } from "./custom-species-ui.js";
export type { UIComponentsOptions } from "./custom-species-ui-components.js";
export { 
  renderPage, 
  renderSpeciesList, 
  renderSpeciesForm, 
  renderSuccess 
} from "./custom-species-ui-components.js";
