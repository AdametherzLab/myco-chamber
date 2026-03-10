/**
 * Custom Species Management UI
 * 
 * Provides a web interface for managing custom mushroom species profiles.
 * Built with Hono and HTMX for a dynamic, server-rendered experience.
 * 
 * @example
 * 
 * import { Hono } from 'hono';
 * import { createCustomSpeciesStore, createCustomSpeciesUI } from 'myco-chamber';
 * 
 * const store = createCustomSpeciesStore({ filePath: './species.json' });
 * const app = new Hono();
 * 
 * // Mount the UI at /species
 * app.route('/species', createCustomSpeciesUI(store));
 * 
 * export default app;
 * 
 */

import { Hono } from 'hono';
import type { CustomSpeciesStore } from './custom-species.js';
import { CustomSpeciesError } from './custom-species.js';
import { isSpeciesProfile } from './validators.js';
import type { SpeciesProfile, StageRanges } from './types.js';
import { 
  renderPage, 
  renderSpeciesList, 
  renderSpeciesForm, 
  renderSuccess,
  type UIComponentsOptions 
} from './custom-species-ui-components.js';

export interface CustomSpeciesUIOptions extends UIComponentsOptions {
  /** Custom title for the UI pages */
  readonly title?: string;
}

/**
 * Create a Hono application serving the Custom Species Management UI.
 * 
 * @param store - The CustomSpeciesStore instance to use for persistence
 * @param options - Configuration options for the UI
 * @returns Hono application with routes for the management interface
 */
export function createCustomSpeciesUI(
  store: CustomSpeciesStore,
  options: CustomSpeciesUIOptions = {}
): Hono {
  const { basePath = "/", title = "Custom Species" } = options;
  const app = new Hono();

  // List all species
  app.get('/', (c) => {
    const species = store.list().map(entry => ({
      id: entry.id,
      commonName: entry.profile.commonName,
      scientificName: entry.profile.scientificName,
      updatedAt: entry.updatedAt,
    }));
    
    const content = renderSpeciesList(species, { basePath });
    return c.html(renderPage(content, title, { basePath }));
  });

  // Form to create new species
  app.get('/new', (c) => {
    const content = renderSpeciesForm('create', {}, undefined, { basePath });
    return c.html(renderPage(content, title, { basePath }));
  });

  // Create new species
  app.post('/', async (c) => {
    const body = await c.req.parseBody();
    
    try {
      const id = String(body.id || '');
      const profile = parseFormToProfile(body);
      
      store.add(id, profile);
      
      const content = renderSuccess(`Created species "${profile.commonName}"`, basePath, { basePath });
      return c.html(renderPage(content, title, { basePath }));
    } catch (err) {
      const errorMsg = err instanceof CustomSpeciesError ? err.message : 'Invalid input data';
      const values = extractFormValues(body);
      const content = renderSpeciesForm('create', values, errorMsg, { basePath });
      return c.html(renderPage(content, title, { basePath }), 400);
    }
  });

  // Form to edit species
  app.get('/:id/edit', (c) => {
    const id = c.req.param('id');
    const entry = store.get(id);
    
    if (!entry) {
      return c.notFound();
    }
    
    const values = profileToFormValues(entry.id, entry.profile);
    const content = renderSpeciesForm('edit', values, undefined, { basePath });
    return c.html(renderPage(content, title, { basePath }));
  });

  // Update species
  app.put('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.parseBody();
    
    try {
      const profile = parseFormToProfile(body);
      store.update(id, profile);
      
      const content = renderSuccess(`Updated species "${profile.commonName}"`, basePath, { basePath });
      return c.html(renderPage(content, title, { basePath }));
    } catch (err) {
      const errorMsg = err instanceof CustomSpeciesError ? err.message : 'Invalid input data';
      const values = extractFormValues(body);
      values.id = id;
      const content = renderSpeciesForm('edit', values, errorMsg, { basePath });
      return c.html(renderPage(content, title, { basePath }), 400);
    }
  });

  // Delete species
  app.delete('/:id', (c) => {
    const id = c.req.param('id');
    const success = store.remove(id);
    
    if (!success) {
      return c.notFound();
    }
    
    return c.body('');
  });

  return app;
}

/** Parse form body into SpeciesProfile */
function parseFormToProfile(body: Record<string, string | File>): SpeciesProfile {
  const incubation: StageRanges = {
    tempMin: Number(body.incubationTempMin),
    tempMax: Number(body.incubationTempMax),
    humidityMin: Number(body.incubationHumidityMin),
    humidityMax: Number(body.incubationHumidityMax),
    co2Max: Number(body.incubationCo2Max),
    faeMin: Number(body.incubationFaeMin),
  };
  
  const fruiting: StageRanges = {
    tempMin: Number(body.fruitingTempMin),
    tempMax: Number(body.fruitingTempMax),
    humidityMin: Number(body.fruitingHumidityMin),
    humidityMax: Number(body.fruitingHumidityMax),
    co2Max: Number(body.fruitingCo2Max),
    faeMin: Number(body.fruitingFaeMin),
  };
  
  const profile: SpeciesProfile = {
    commonName: String(body.commonName || ''),
    scientificName: String(body.scientificName || ''),
    incubation,
    fruiting,
    notes: body.notes ? String(body.notes) : undefined,
  };
  
  if (!isSpeciesProfile(profile)) {
    throw new CustomSpeciesError('Invalid species profile data: check all ranges are valid numbers');
  }
  
  return profile;
}

/** Convert profile to form values */
function profileToFormValues(id: string, profile: SpeciesProfile): Record<string, string | number> {
  return {
    id,
    commonName: profile.commonName,
    scientificName: profile.scientificName,
    notes: profile.notes || '',
    incubationTempMin: profile.incubation.tempMin,
    incubationTempMax: profile.incubation.tempMax,
    incubationHumidityMin: profile.incubation.humidityMin,
    incubationHumidityMax: profile.incubation.humidityMax,
    incubationCo2Max: profile.incubation.co2Max,
    incubationFaeMin: profile.incubation.faeMin,
    fruitingTempMin: profile.fruiting.tempMin,
    fruitingTempMax: profile.fruiting.tempMax,
    fruitingHumidityMin: profile.fruiting.humidityMin,
    fruitingHumidityMax: profile.fruiting.humidityMax,
    fruitingCo2Max: profile.fruiting.co2Max,
    fruitingFaeMin: profile.fruiting.faeMin,
  };
}

/** Extract form values for repopulating form on error */
function extractFormValues(body: Record<string, string | File>): Record<string, string | number> {
  const values: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      if (key.includes('Temp') || key.includes('Humidity') || key.includes('Co2') || key.includes('Fae')) {
        values[key] = value === '' ? 0 : Number(value);
      } else {
        values[key] = value;
      }
    }
  }
  return values;
}
