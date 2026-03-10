import { describe, it, expect, beforeEach } from "bun:test";
import { createCustomSpeciesUI } from "../src/custom-species-ui.ts";
import { createCustomSpeciesStore } from "../src/custom-species.ts";
import type { SpeciesProfile } from "../src/types.ts";

describe("CustomSpeciesUI", () => {
  let store: ReturnType<typeof createCustomSpeciesStore>;
  
  beforeEach(() => {
    store = createCustomSpeciesStore();
  });

  describe("GET /", () => {
    it("renders empty state when no species exist", async () => {
      const app = createCustomSpeciesUI(store);
      const res = await app.request('/');
      
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('No Custom Species');
      expect(text).toContain('Add Your First Species');
      expect(text).toContain('htmx.org');
    });

    it("lists custom species with HTMX delete buttons", async () => {
      store.add("test_species", {
        commonName: "Test Mushroom",
        scientificName: "Testus mushroomus",
        incubation: { tempMin: 20, tempMax: 25, humidityMin: 70, humidityMax: 80, co2Max: 5000, faeMin: 1 },
        fruiting: { tempMin: 18, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Max: 800, faeMin: 4 },
      });
      
      const app = createCustomSpeciesUI(store);
      const res = await app.request('/');
      
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('Test Mushroom');
      expect(text).toContain('Testus mushroomus');
      expect(text).toContain('hx-delete="/test_species"');
      expect(text).toContain('hx-confirm=');
    });
  });

  describe("GET /new", () => {
    it("renders creation form with default values", async () => {
      const app = createCustomSpeciesUI(store);
      const res = await app.request('/new');
      
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('Add New Species');
      expect(text).toContain('name="commonName"');
      expect(text).toContain('name="incubationTempMin"');
      expect(text).toContain('value="20"');
      expect(text).toContain('pattern="[a-z][a-z0-9_]{1,48}[a-z0-9]"');
    });
  });

  describe("POST /", () => {
    it("creates new species with valid data and redirects", async () => {
      const app = createCustomSpeciesUI(store);
      const formData = new FormData();
      formData.append('id', 'new_species');
      formData.append('commonName', 'New Mushroom');
      formData.append('scientificName', 'Novus fungus');
      formData.append('notes', 'Test notes');
      formData.append('incubationTempMin', '20');
      formData.append('incubationTempMax', '24');
      formData.append('incubationHumidityMin', '70');
      formData.append('incubationHumidityMax', '80');
      formData.append('incubationCo2Max', '5000');
      formData.append('incubationFaeMin', '1');
      formData.append('fruitingTempMin', '18');
      formData.append('fruitingTempMax', '22');
      formData.append('fruitingHumidityMin', '85');
      formData.append('fruitingHumidityMax', '95');
      formData.append('fruitingCo2Max', '800');
      formData.append('fruitingFaeMin', '4');
      
      const res = await app.request('/', {
        method: 'POST',
        body: formData,
      });
      
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('Created species');
      expect(text).toContain('Redirecting');
      expect(store.size).toBe(1);
      expect(store.getProfile('new_species')?.commonName).toBe('New Mushroom');
    });

    it("rejects invalid species ID with 400 error", async () => {
      const app = createCustomSpeciesUI(store);
      const formData = new FormData();
      formData.append('id', 'INVALID ID');
      formData.append('commonName', 'Bad ID');
      formData.append('scientificName', 'Badus idus');
      const ranges = [
        ['incubationTempMin', '20'], ['incubationTempMax', '24'],
        ['incubationHumidityMin', '70'], ['incubationHumidityMax', '80'],
        ['incubationCo2Max', '5000'], ['incubationFaeMin', '1'],
        ['fruitingTempMin', '18'], ['fruitingTempMax', '22'],
        ['fruitingHumidityMin', '85'], ['fruitingHumidityMax', '95'],
        ['fruitingCo2Max', '800'], ['fruitingFaeMin', '4']
      ];
      ranges.forEach(([k, v]) => formData.append(k, v));
      
      const res = await app.request('/', {
        method: 'POST',
        body: formData,
      });
      
      expect(res.status).toBe(400);
      const text = await res.text();
      expect(text).toContain('Invalid species ID');
    });

    it("rejects duplicate IDs with error message", async () => {
      store.add("duplicate", {
        commonName: "Existing",
        scientificName: "Existus",
        incubation: { tempMin: 20, tempMax: 24, humidityMin: 70, humidityMax: 80, co2Max: 5000, faeMin: 1 },
        fruiting: { tempMin: 18, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Max: 800, faeMin: 4 },
      });
      
      const app = createCustomSpeciesUI(store);
      const formData = new FormData();
      formData.append('id', 'duplicate');
      formData.append('commonName', 'Duplicate');
      formData.append('scientificName', 'Duplicate');
      const ranges = [
        ['incubationTempMin', '20'], ['incubationTempMax', '24'],
        ['incubationHumidityMin', '70'], ['incubationHumidityMax', '80'],
        ['incubationCo2Max', '5000'], ['incubationFaeMin', '1'],
        ['fruitingTempMin', '18'], ['fruitingTempMax', '22'],
        ['fruitingHumidityMin', '85'], ['fruitingHumidityMax', '95'],
        ['fruitingCo2Max', '800'], ['fruitingFaeMin', '4']
      ];
      ranges.forEach(([k, v]) => formData.append(k, v));
      
      const res = await app.request('/', {
        method: 'POST',
        body: formData,
      });
      
      expect(res.status).toBe(400);
      const text = await res.text();
      expect(text).toContain('already exists');
    });
  });

  describe("GET /:id/edit", () => {
    it("renders edit form with existing values populated", async () => {
      store.add("edit_test", {
        commonName: "Editable Mushroom",
        scientificName: "Editus shroomus",
        incubation: { tempMin: 21, tempMax: 23, humidityMin: 75, humidityMax: 85, co2Max: 4000, faeMin: 2 },
        fruiting: { tempMin: 19, tempMax: 21, humidityMin: 90, humidityMax: 95, co2Max: 600, faeMin: 5 },
        notes: "Test notes here",
      });
      
      const app = createCustomSpeciesUI(store);
      const res = await app.request('/edit_test/edit');
      
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('Edit Editable Mushroom');
      expect(text).toContain('value="Editable Mushroom"');
      expect(text).toContain('value="21"');
      expect(text).toContain('Test notes here');
      expect(text).toContain('readonly');
    });

    it("returns 404 for non-existent species", async () => {
      const app = createCustomSpeciesUI(store);
      const res = await app.request('/nonexistent/edit');
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /:id", () => {
    it("updates existing species and shows success", async () => {
      store.add("update_test", {
        commonName: "Old Name",
        scientificName: "Oldus nameus",
        incubation: { tempMin: 20, tempMax: 24, humidityMin: 70, humidityMax: 80, co2Max: 5000, faeMin: 1 },
        fruiting: { tempMin: 18, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Max: 800, faeMin: 4 },
      });
      
      const app = createCustomSpeciesUI(store);
      const formData = new FormData();
      formData.append('commonName', 'New Name');
      formData.append('scientificName', 'Newus nameus');
      formData.append('notes', 'Updated notes');
      formData.append('incubationTempMin', '22');
      formData.append('incubationTempMax', '26');
      formData.append('incubationHumidityMin', '75');
      formData.append('incubationHumidityMax', '85');
      formData.append('incubationCo2Max', '6000');
      formData.append('incubationFaeMin', '2');
      formData.append('fruitingTempMin', '20');
      formData.append('fruitingTempMax', '24');
      formData.append('fruitingHumidityMin', '90');
      formData.append('fruitingHumidityMax', '95');
      formData.append('fruitingCo2Max', '1000');
      formData.append('fruitingFaeMin', '5');
      
      const res = await app.request('/update_test', {
        method: 'PUT',
        body: formData,
      });
      
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('Updated species');
      
      const updated = store.get('update_test');
      expect(updated?.profile.commonName).toBe('New Name');
      expect(updated?.profile.incubation.tempMin).toBe(22);
      expect(updated?.profile.notes).toBe('Updated notes');
    });

    it("returns 400 for invalid update data", async () => {
      store.add("bad_update", {
        commonName: "Test",
        scientificName: "Test",
        incubation: { tempMin: 20, tempMax: 24, humidityMin: 70, humidityMax: 80, co2Max: 5000, faeMin: 1 },
        fruiting: { tempMin: 18, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Max: 800, faeMin: 4 },
      });
      
      const app = createCustomSpeciesUI(store);
      const formData = new FormData();
      formData.append('commonName', '');
      formData.append('scientificName', '');
      
      const res = await app.request('/bad_update', {
        method: 'PUT',
        body: formData,
      });
      
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /:id", () => {
    it("deletes species and returns empty body for HTMX removal", async () => {
      store.add("delete_test", {
        commonName: "To Delete",
        scientificName: "Deletus meus",
        incubation: { tempMin: 20, tempMax: 24, humidityMin: 70, humidityMax: 80, co2Max: 5000, faeMin: 1 },
        fruiting: { tempMin: 18, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Max: 800, faeMin: 4 },
      });
      
      const app = createCustomSpeciesUI(store);
      const res = await app.request('/delete_test', { method: 'DELETE' });
      
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
      expect(store.size).toBe(0);
    });

    it("returns 404 for non-existent species", async () => {
      const app = createCustomSpeciesUI(store);
      const res = await app.request('/nonexistent', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });

  describe("UI configuration options", () => {
    it("respects custom basePath in links", async () => {
      store.add("path_test", {
        commonName: "Path Test",
        scientificName: "Pathus testus",
        incubation: { tempMin: 20, tempMax: 24, humidityMin: 70, humidityMax: 80, co2Max: 5000, faeMin: 1 },
        fruiting: { tempMin: 18, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Max: 800, faeMin: 4 },
      });
      
      const app = createCustomSpeciesUI(store, { basePath: "/species/" });
      const res = await app.request('/');
      const text = await res.text();
      
      expect(text).toContain('href="/species/new"');
      expect(text).toContain('hx-delete="/species/path_test"');
    });
  });
});
