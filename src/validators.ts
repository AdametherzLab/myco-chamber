import type { EnvironmentConditions, StageRanges, SpeciesProfile } from './types.js';

export function isEnvironmentConditions(input: unknown): input is EnvironmentConditions {
  return (
    typeof input === 'object' &&
    input !== null &&
    'temperature' in input &&
    'humidity' in input &&
    'co2' in input &&
    'fae' in input &&
    typeof input.temperature === 'number' &&
    typeof input.humidity === 'number' &&
    input.humidity >= 0 &&
    input.humidity <= 100 &&
    typeof input.co2 === 'number' &&
    input.co2 >= 0 &&
    typeof input.fae === 'number' &&
    input.fae >= 0
  );
}

export function isStageRanges(input: unknown): input is StageRanges {
  return (
    typeof input === 'object' &&
    input !== null &&
    'tempMin' in input &&
    'tempMax' in input &&
    'humidityMin' in input &&
    'humidityMax' in input &&
    'co2Max' in input &&
    'faeMin' in input &&
    typeof input.tempMin === 'number' &&
    typeof input.tempMax === 'number' &&
    input.tempMin <= input.tempMax &&
    typeof input.humidityMin === 'number' &&
    typeof input.humidityMax === 'number' &&
    input.humidityMin <= input.humidityMax &&
    input.humidityMin >= 0 &&
    input.humidityMax <= 100 &&
    typeof input.co2Max === 'number' &&
    input.co2Max >= 0 &&
    typeof input.faeMin === 'number' &&
    input.faeMin >= 0
  );
}

export function isSpeciesProfile(input: unknown): input is SpeciesProfile {
  return (
    typeof input === 'object' &&
    input !== null &&
    'commonName' in input &&
    'scientificName' in input &&
    'incubation' in input &&
    'fruiting' in input &&
    typeof input.commonName === 'string' &&
    typeof input.scientificName === 'string' &&
    isStageRanges(input.incubation) &&
    isStageRanges(input.fruiting)
  );
}
