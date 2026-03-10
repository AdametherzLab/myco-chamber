import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { SpeciesProfile } from "./types.js";
import { isSpeciesProfile } from "./validators.js";

/**
 * Error thrown when custom species operations fail.
 */
export class CustomSpeciesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomSpeciesError";
  }
}

/**
 * A stored custom species entry with metadata.
 */
export interface CustomSpeciesEntry {
  readonly id: string;
  readonly profile: SpeciesProfile;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Options for creating a custom species store.
 */
export interface CustomSpeciesStoreOptions {
  /** File path for JSON persistence. If omitted, store is in-memory only. */
  readonly filePath?: string;
}

/**
 * Manages user-defined mushroom species profiles with optional file persistence.
 */
export interface CustomSpeciesStore {
  /** Add a new custom species profile. Throws if ID already exists. */
  add(id: string, profile: SpeciesProfile): CustomSpeciesEntry;
  /** Get a custom species by ID. Returns undefined if not found. */
  get(id: string): CustomSpeciesEntry | undefined;
  /** Update an existing custom species. Throws if ID not found. */
  update(id: string, partial: Partial<SpeciesProfile>): CustomSpeciesEntry;
  /** Delete a custom species by ID. Returns true if deleted, false if not found. */
  remove(id: string): boolean;
  /** List all custom species entries. */
  list(): readonly CustomSpeciesEntry[];
  /** Get just the profile for a species ID (compatible with built-in lookup). */
  getProfile(id: string): SpeciesProfile | undefined;
  /** Export all custom species as a JSON string. */
  exportJSON(): string;
  /** Import species from a JSON string. Returns count of imported profiles. */
  importJSON(json: string): number;
  /** Remove all custom species. */
  clear(): void;
  /** Number of stored custom species. */
  readonly size: number;
}

const VALID_ID_RE = /^[a-z][a-z0-9_]{1,48}[a-z0-9]$/;

/**
 * Validate a species ID string.
 */
function validateId(id: string): void {
  if (typeof id !== "string" || !VALID_ID_RE.test(id)) {
    throw new CustomSpeciesError(
      `Invalid species ID "${id}". Must be 3-50 chars, lowercase alphanumeric with underscores, starting with a letter.`
    );
  }
}

/**
 * Validate a full species profile.
 */
function validateProfile(profile: unknown): asserts profile is SpeciesProfile {
  if (!isSpeciesProfile(profile)) {
    throw new CustomSpeciesError(
      "Invalid species profile. Must include commonName, scientificName, and valid incubation/fruiting stage ranges."
    );
  }
  const p = profile as SpeciesProfile;
  if (p.commonName.trim().length === 0) {
    throw new CustomSpeciesError("commonName must not be empty.");
  }
  if (p.scientificName.trim().length === 0) {
    throw new CustomSpeciesError("scientificName must not be empty.");
  }
}

interface SerializedStore {
  version: number;
  entries: Record<string, { profile: SpeciesProfile; createdAt: string; updatedAt: string }>;
}

/**
 * Create a custom species store with optional file persistence.
 *
 * @param options - Store configuration
 * @returns A CustomSpeciesStore instance
 *
 * @example
 * 
 * const store = createCustomSpeciesStore({ filePath: "./my-species.json" });
 * store.add("morel_black", {
 *   commonName: "Black Morel",
 *   scientificName: "Morchella elata",
 *   incubation: { tempMin: 18, tempMax: 22, humidityMin: 70, humidityMax: 80, co2Max: 5000, faeMin: 1 },
 *   fruiting: { tempMin: 10, tempMax: 16, humidityMin: 85, humidityMax: 95, co2Max: 600, faeMin: 6 },
 *   notes: "Difficult to cultivate. Requires cold stratification."
 * });
 * 
 */
export function createCustomSpeciesStore(options: CustomSpeciesStoreOptions = {}): CustomSpeciesStore {
  const entries = new Map<string, CustomSpeciesEntry>();
  const { filePath } = options;

  // Load from file if it exists
  if (filePath && existsSync(filePath)) {
    try {
      const raw = readFileSync(filePath, "utf-8");
      const data: SerializedStore = JSON.parse(raw);
      if (data.version === 1 && data.entries) {
        for (const [id, entry] of Object.entries(data.entries)) {
          if (isSpeciesProfile(entry.profile)) {
            entries.set(id, {
              id,
              profile: entry.profile,
              createdAt: entry.createdAt,
              updatedAt: entry.updatedAt,
            });
          }
        }
      }
    } catch {
      // If file is corrupt, start fresh
    }
  }

  function persist(): void {
    if (!filePath) return;
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const data: SerializedStore = {
      version: 1,
      entries: Object.fromEntries(
        [...entries.entries()].map(([id, e]) => [
          id,
          { profile: e.profile, createdAt: e.createdAt, updatedAt: e.updatedAt },
        ])
      ),
    };
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  const store: CustomSpeciesStore = {
    add(id: string, profile: SpeciesProfile): CustomSpeciesEntry {
      validateId(id);
      validateProfile(profile);
      if (entries.has(id)) {
        throw new CustomSpeciesError(`Species "${id}" already exists. Use update() to modify.`);
      }
      const now = new Date().toISOString();
      const entry: CustomSpeciesEntry = { id, profile, createdAt: now, updatedAt: now };
      entries.set(id, entry);
      persist();
      return entry;
    },

    get(id: string): CustomSpeciesEntry | undefined {
      return entries.get(id);
    },

    update(id: string, partial: Partial<SpeciesProfile>): CustomSpeciesEntry {
      const existing = entries.get(id);
      if (!existing) {
        throw new CustomSpeciesError(`Species "${id}" not found.`);
      }
      const merged: SpeciesProfile = {
        commonName: partial.commonName ?? existing.profile.commonName,
        scientificName: partial.scientificName ?? existing.profile.scientificName,
        incubation: partial.incubation ?? existing.profile.incubation,
        fruiting: partial.fruiting ?? existing.profile.fruiting,
        ...(partial.notes !== undefined ? { notes: partial.notes } : existing.profile.notes ? { notes: existing.profile.notes } : {}),
      };
      validateProfile(merged);
      const entry: CustomSpeciesEntry = {
        id,
        profile: merged,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      entries.set(id, entry);
      persist();
      return entry;
    },

    remove(id: string): boolean {
      const had = entries.delete(id);
      if (had) persist();
      return had;
    },

    list(): readonly CustomSpeciesEntry[] {
      return [...entries.values()];
    },

    getProfile(id: string): SpeciesProfile | undefined {
      return entries.get(id)?.profile;
    },

    exportJSON(): string {
      const data: SerializedStore = {
        version: 1,
        entries: Object.fromEntries(
          [...entries.entries()].map(([id, e]) => [
            id,
            { profile: e.profile, createdAt: e.createdAt, updatedAt: e.updatedAt },
          ])
        ),
      };
      return JSON.stringify(data, null, 2);
    },

    importJSON(json: string): number {
      let data: SerializedStore;
      try {
        data = JSON.parse(json);
      } catch {
        throw new CustomSpeciesError("Invalid JSON input.");
      }
      if (!data || data.version !== 1 || !data.entries || typeof data.entries !== "object") {
        throw new CustomSpeciesError("Invalid custom species data format. Expected version 1.");
      }
      let count = 0;
      for (const [id, entry] of Object.entries(data.entries)) {
        try {
          validateId(id);
          validateProfile(entry.profile);
        } catch {
          continue; // Skip invalid entries
        }
        const now = new Date().toISOString();
        entries.set(id, {
          id,
          profile: entry.profile,
          createdAt: entry.createdAt || now,
          updatedAt: entry.updatedAt || now,
        });
        count++;
      }
      if (count > 0) persist();
      return count;
    },

    clear(): void {
      entries.clear();
      persist();
    },

    get size(): number {
      return entries.size;
    },
  };

  return store;
}

/**
 * Export a single species profile to a portable JSON format
 * @param profile - Validated species profile to export
 * @returns JSON string containing only the profile data
 * @throws {CustomSpeciesError} If profile validation fails
 */
export function exportProfile(profile: SpeciesProfile): string {
  validateProfile(profile);
  return JSON.stringify(profile, null, 2);
}

/**
 * Import a species profile from JSON format
 * @param json - JSON string containing species profile data
 * @returns Validated SpeciesProfile object
 * @throws {CustomSpeciesError} If JSON is invalid or profile validation fails
 */
export function importProfile(json: string): SpeciesProfile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new CustomSpeciesError("Invalid JSON format");
  }

  try {
    validateProfile(parsed);
  } catch (error) {
    throw new CustomSpeciesError(`Invalid species profile: ${error instanceof Error ? error.message : String(error)}`);
  }

  return parsed as SpeciesProfile;
}
