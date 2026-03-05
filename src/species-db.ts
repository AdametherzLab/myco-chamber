import type { SpeciesId, SpeciesProfile } from "./types.js";

/**
 * Branded type constructor for SpeciesId.
 * @param id - Raw string identifier
 * @returns Branded SpeciesId
 */
function createSpeciesId(id: string): SpeciesId {
  return id as SpeciesId;
}

/**
 * Mushroom species database containing profiles for 30+ species.
 * Each profile defines precise incubation and fruiting temperature,
 * humidity, CO2, and FAE ranges.
 */
const speciesDatabase = {
  shiitake: {
    commonName: "Shiitake",
    scientificName: "Lentinula edodes",
    incubation: {
      tempMin: 20,
      tempMax: 26,
      humidityMin: 70,
      humidityMax: 80,
      co2Max: 5000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 12,
      tempMax: 20,
      humidityMin: 80,
      humidityMax: 95,
      co2Max: 1000,
      faeMin: 4,
    },
    notes: "Requires a cold shock to initiate pinning. Prefers hardwood substrates.",
  },
  oyster_blue: {
    commonName: "Blue Oyster",
    scientificName: "Pleurotus ostreatus",
    incubation: {
      tempMin: 20,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 8000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 15,
      tempMax: 22,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 800,
      faeMin: 6,
    },
    notes: "Fast colonizer. Tolerates higher CO2 during incubation.",
  },
  oyster_king: {
    commonName: "King Oyster",
    scientificName: "Pleurotus eryngii",
    incubation: {
      tempMin: 20,
      tempMax: 25,
      humidityMin: 75,
      humidityMax: 85,
      co2Max: 6000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 15,
      tempMax: 20,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 600,
      faeMin: 5,
    },
    notes: "Produces thick, meaty stems. Requires lower temperatures for fruiting.",
  },
  oyster_pink: {
    commonName: "Pink Oyster",
    scientificName: "Pleurotus djamor",
    incubation: {
      tempMin: 24,
      tempMax: 30,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 8000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 20,
      tempMax: 28,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 800,
      faeMin: 6,
    },
    notes: "Heat-loving species. Fast fruiting cycle.",
  },
  lions_mane: {
    commonName: "Lion's Mane",
    scientificName: "Hericium erinaceus",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 75,
      humidityMax: 85,
      co2Max: 5000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 16,
      tempMax: 22,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 600,
      faeMin: 5,
    },
    notes: "Sensitive to high CO2. Requires high humidity for proper spine formation.",
  },
  reishi: {
    commonName: "Reishi",
    scientificName: "Ganoderma lucidum",
    incubation: {
      tempMin: 22,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 10000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 22,
      tempMax: 28,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 500,
      faeMin: 8,
    },
    notes: "Produces antler or conk formations. High FAE required for antler form.",
  },
  chestnut: {
    commonName: "Chestnut",
    scientificName: "Pholiota adiposa",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 80,
      co2Max: 5000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 10,
      tempMax: 18,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 800,
      faeMin: 4,
    },
    notes: "Prefers cooler fruiting temperatures. Slow colonizer.",
  },
  maitake: {
    commonName: "Maitake",
    scientificName: "Grifola frondosa",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 80,
      co2Max: 6000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 15,
      tempMax: 20,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 600,
      faeMin: 6,
    },
    notes: "Also known as Hen of the Woods. Forms large clustered fruiting bodies.",
  },
  enoki: {
    commonName: "Enoki",
    scientificName: "Flammulina velutipes",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 80,
      co2Max: 8000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 5,
      tempMax: 12,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 2000,
      faeMin: 2,
    },
    notes: "Requires cold fruiting temperatures and high CO2 for long, thin stems.",
  },
  wine_cap: {
    commonName: "Wine Cap",
    scientificName: "Stropharia rugosoannulata",
    incubation: {
      tempMin: 20,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 7000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 15,
      tempMax: 25,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 800,
      faeMin: 4,
    },
    notes: "Grows well outdoors on wood chips. Tolerant of variable conditions.",
  },
  pioppino: {
    commonName: "Pioppino",
    scientificName: "Agrocybe aegerita",
    incubation: {
      tempMin: 22,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 6000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 700,
      faeMin: 5,
    },
    notes: "Also known as Black Poplar mushroom. Clusters abundantly.",
  },
  nameko: {
    commonName: "Nameko",
    scientificName: "Pholiota nameko",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 6000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 10,
      tempMax: 18,
      humidityMin: 90,
      humidityMax: 98,
      co2Max: 800,
      faeMin: 4,
    },
    notes: "Requires very high humidity. Produces slimy caps.",
  },
  turkey_tail: {
    commonName: "Turkey Tail",
    scientificName: "Trametes versicolor",
    incubation: {
      tempMin: 20,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 8000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 18,
      tempMax: 26,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 500,
      faeMin: 8,
    },
    notes: "Medicinal mushroom. Grows as a shelf fungus.",
  },
  shaggy_mane: {
    commonName: "Shaggy Mane",
    scientificName: "Coprinus comatus",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 5000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 15,
      tempMax: 22,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 600,
      faeMin: 5,
    },
    notes: "Deliquesces quickly after harvest. Best consumed fresh.",
  },
  morel: {
    commonName: "Morel",
    scientificName: "Morchella esculenta",
    incubation: {
      tempMin: 18,
      tempMax: 22,
      humidityMin: 70,
      humidityMax: 80,
      co2Max: 5000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 10,
      tempMax: 18,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 600,
      faeMin: 6,
    },
    notes: "Difficult to cultivate commercially. Requires specific soil conditions.",
  },
  oyster_golden: {
    commonName: "Golden Oyster",
    scientificName: "Pleurotus citrinopileatus",
    incubation: {
      tempMin: 22,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 8000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 18,
      tempMax: 26,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 800,
      faeMin: 6,
    },
    notes: "Bright yellow color. Prefers warmer temperatures.",
  },
  oyster_phoenix: {
    commonName: "Phoenix Oyster",
    scientificName: "Pleurotus pulmonarius",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 7000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 15,
      tempMax: 22,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 700,
      faeMin: 5,
    },
    notes: "Also known as Indian Oyster. Tolerant of lower humidity.",
  },
  almond_portobello: {
    commonName: "Almond Portobello",
    scientificName: "Agaricus subrufescens",
    incubation: {
      tempMin: 22,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 80,
      co2Max: 10000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 800,
      faeMin: 6,
    },
    notes: "Medicinal Agaricus species. Requires casing layer.",
  },
  button_mushroom: {
    commonName: "Button Mushroom",
    scientificName: "Agaricus bisporus",
    incubation: {
      tempMin: 22,
      tempMax: 26,
      humidityMin: 70,
      humidityMax: 80,
      co2Max: 10000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 16,
      tempMax: 20,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 800,
      faeMin: 5,
    },
    notes: "Most commonly cultivated mushroom worldwide. Requires compost substrate.",
  },
  shimeji: {
    commonName: "Shimeji",
    scientificName: "Hypsizygus tessellatus",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 6000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 15,
      tempMax: 20,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 700,
      faeMin: 5,
    },
    notes: "Also known as Beech Mushroom. Grows in dense clusters.",
  },
  wood_ear: {
    commonName: "Wood Ear",
    scientificName: "Auricularia auricula-judae",
    incubation: {
      tempMin: 20,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 8000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 18,
      tempMax: 26,
      humidityMin: 85,
      humidityMax: 98,
      co2Max: 600,
      faeMin: 4,
    },
    notes: "Jelly fungus. Requires very high humidity.",
  },
  chicken_of_the_woods: {
    commonName: "Chicken of the Woods",
    scientificName: "Laetiporus sulphureus",
    incubation: {
      tempMin: 20,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 7000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 18,
      tempMax: 26,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 600,
      faeMin: 6,
    },
    notes: "Shelf fungus with chicken-like texture. Difficult to cultivate.",
  },
  black_poplar: {
    commonName: "Black Poplar",
    scientificName: "Agrocybe cylindracea",
    incubation: {
      tempMin: 22,
      tempMax: 28,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 6000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 700,
      faeMin: 5,
    },
    notes: "Similar to Pioppino. Grows on hardwood stumps.",
  },
  velvet_pioppini: {
    commonName: "Velvet Pioppini",
    scientificName: "Agrocybe dura",
    incubation: {
      tempMin: 20,
      tempMax: 26,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 6000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 16,
      tempMax: 22,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 700,
      faeMin: 5,
    },
    notes: "Smaller relative of Pioppino with velvety caps.",
  },
  brick_top: {
    commonName: "Brick Top",
    scientificName: "Hypholoma sublateritium",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 6000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 15,
      tempMax: 20,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 800,
      faeMin: 4,
    },
    notes: "Attractive brick-red caps. Grows on hardwood logs.",
  },
  parasol: {
    commonName: "Parasol Mushroom",
    scientificName: "Macrolepiota procera",
    incubation: {
      tempMin: 20,
      tempMax: 26,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 5000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 16,
      tempMax: 22,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 600,
      faeMin: 5,
    },
    notes: "Large, tall mushrooms. Difficult to cultivate indoors.",
  },
  blewit: {
    commonName: "Blewit",
    scientificName: "Clitocybe nuda",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 5000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 10,
      tempMax: 18,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 600,
      faeMin: 4,
    },
    notes: "Purple-lilac cap and stem. Prefers cool fruiting temperatures.",
  },
  cordyceps: {
    commonName: "Cordyceps",
    scientificName: "Cordyceps militaris",
    incubation: {
      tempMin: 20,
      tempMax: 25,
      humidityMin: 70,
      humidityMax: 80,
      co2Max: 5000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 18,
      tempMax: 22,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 500,
      faeMin: 6,
    },
    notes: "Medicinal species. Requires light for fruiting body formation.",
  },
  oyster_pearl: {
    commonName: "Pearl Oyster",
    scientificName: "Pleurotus ostreatus var. florida",
    incubation: {
      tempMin: 20,
      tempMax: 26,
      humidityMin: 70,
      humidityMax: 85,
      co2Max: 8000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 15,
      tempMax: 24,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 800,
      faeMin: 5,
    },
    notes: "White to cream colored. Versatile grower.",
  },
  chaga: {
    commonName: "Chaga",
    scientificName: "Inonotus obliquus",
    incubation: {
      tempMin: 18,
      tempMax: 24,
      humidityMin: 70,
      humidityMax: 80,
      co2Max: 5000,
      faeMin: 1,
    },
    fruiting: {
      tempMin: 10,
      tempMax: 20,
      humidityMin: 85,
      humidityMax: 95,
      co2Max: 600,
      faeMin: 4,
    },
    notes: "Medicinal fungus. Extremely slow growing, typically harvested from birch trees.",
  },
} as const satisfies Record<string, SpeciesProfile>;

type SpeciesEntry = SpeciesProfile & { id: SpeciesId };

export function getAllSpecies(): SpeciesEntry[] {
  return Object.entries(speciesDatabase).map(([id, profile]) => ({
    ...profile,
    id: createSpeciesId(id),
  }));
}

export function getSpeciesById(id: string): SpeciesEntry {
  const profile = speciesDatabase[id as keyof typeof speciesDatabase];
  if (!profile) throw new RangeError(`Unknown species: ${id}`);
  return { ...profile, id: createSpeciesId(id) };
}

export function searchSpeciesByName(query: string): SpeciesEntry[] {
  if (!query) return [];
  const q = query.toLowerCase();
  return getAllSpecies().filter(
    s => s.commonName.toLowerCase().includes(q) || s.scientificName.toLowerCase().includes(q)
  );
}

export function getSpeciesByStageConditions(
  stage: "incubation" | "fruiting",
  conditions: { temperature?: number; humidity?: number }
): SpeciesEntry[] {
  return getAllSpecies().filter(s => {
    const ranges = s[stage];
    if (conditions.temperature !== undefined) {
      if (conditions.temperature < ranges.tempMin || conditions.temperature > ranges.tempMax) return false;
    }
    if (conditions.humidity !== undefined) {
      if (conditions.humidity < ranges.humidityMin || conditions.humidity > ranges.humidityMax) return false;
    }
    return true;
  });
}