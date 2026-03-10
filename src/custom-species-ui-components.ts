/**
 * HTML component generators for the Custom Species Management UI.
 * Provides type-safe HTML generation for forms, lists, and interactive elements.
 */

export interface UIComponentsOptions {
  /** Base URL path for the UI */
  readonly basePath?: string;
  /** HTMX version to use from CDN */
  readonly htmxVersion?: string;
  /** PicoCSS version for styling */
  readonly picoVersion?: string;
}

/**
 * Generate the HTML shell with HTMX and styling
 * @param content - Main content HTML
 * @param title - Page title
 * @param options - UI configuration options
 * @returns Complete HTML document
 */
export function renderPage(content: string, title: string, options: UIComponentsOptions = {}): string {
  const { basePath = "/", htmxVersion = "1.9.12", picoVersion = "2.0.6" } = options;
  
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Myco Chamber</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@${picoVersion}/css/pico.min.css">
  <script src="https://unpkg.com/htmx.org@${htmxVersion}"></script>
  <style>
    .species-card { margin-bottom: 1rem; }
    .range-display { font-family: monospace; font-size: 0.9em; color: var(--muted-color); }
    .alert { padding: 1rem; border-radius: 0.25rem; margin-bottom: 1rem; }
    .alert.success { background: var(--form-element-valid-active-border-color); color: white; }
    .alert.error { background: var(--form-element-invalid-active-border-color); color: white; }
    tr.htmx-swapping { opacity: 0; transition: opacity 0.5s; }
  </style>
</head>
<body>
  <nav class="container-fluid">
    <ul>
      <li><strong>Myco Chamber</strong></li>
    </ul>
    <ul>
      <li><a href="${basePath}">Species List</a></li>
      <li><a href="${basePath}new" role="button">Add Species</a></li>
    </ul>
  </nav>
  <main class="container">
    ${content}
  </main>
</body>
</html>`;
}

/**
 * Render the species list view
 * @param species - Array of species summary objects
 * @param options - UI configuration options
 * @returns HTML string for the species list
 */
export function renderSpeciesList(
  species: Array<{ id: string; commonName: string; scientificName: string; updatedAt: string }>,
  options: UIComponentsOptions = {}
): string {
  const { basePath = "/" } = options;
  
  if (species.length === 0) {
    return `<article>
      <header><h2>No Custom Species</h2></header>
      <p>You haven't added any custom species yet. Click "Add Species" to create your first profile.</p>
      <a href="${basePath}new" role="button">Add Your First Species</a>
    </article>`;
  }

  const rows = species.map(s => `
    <tr>
      <td><strong>${escapeHtml(s.commonName)}</strong></td>
      <td><em>${escapeHtml(s.scientificName)}</em></td>
      <td>${new Date(s.updatedAt).toLocaleDateString()}</td>
      <td>
        <div class="grid">
          <a href="${basePath}${s.id}/edit" role="button" class="secondary">Edit</a>
          <button class="contrast outline" 
                  hx-delete="${basePath}${s.id}" 
                  hx-confirm="Delete ${escapeHtml(s.commonName)}?"
                  hx-target="closest tr"
                  hx-swap="outerHTML swap:0.5s">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  return `<article>
    <header><h2>Custom Species (${species.length})</h2></header>
    <table>
      <thead>
        <tr>
          <th>Common Name</th>
          <th>Scientific Name</th>
          <th>Last Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </article>`;
}

/**
 * Render the species form (for both create and edit)
 * @param mode - Whether creating or editing
 * @param values - Form values to populate
 * @param error - Optional error message to display
 * @param options - UI configuration options
 * @returns HTML string for the form
 */
export function renderSpeciesForm(
  mode: 'create' | 'edit',
  values: Partial<{
    id: string;
    commonName: string;
    scientificName: string;
    notes: string;
    incubationTempMin: number;
    incubationTempMax: number;
    incubationHumidityMin: number;
    incubationHumidityMax: number;
    incubationCo2Max: number;
    incubationFaeMin: number;
    fruitingTempMin: number;
    fruitingTempMax: number;
    fruitingHumidityMin: number;
    fruitingHumidityMax: number;
    fruitingCo2Max: number;
    fruitingFaeMin: number;
  }> = {},
  error?: string,
  options: UIComponentsOptions = {}
): string {
  const { basePath = "/" } = options;
  const isEdit = mode === 'edit';
  const action = isEdit ? `${basePath}${values.id}` : basePath;
  const title = isEdit ? `Edit ${values.commonName || 'Species'}` : 'Add New Species';
  
  const errorBanner = error ? `<div class="alert error">${escapeHtml(error)}</div>` : '';
  
  return `<article>
    <header><h2>${title}</h2></header>
    ${errorBanner}
    <form hx-${isEdit ? 'put' : 'post'}="${action}" hx-target="main" hx-swap="innerHTML">
      <fieldset>
        <legend>Basic Information</legend>
        <div class="grid">
          <label>
            Species ID
            <input type="text" name="id" placeholder="e.g., morel_black" 
                   value="${escapeHtml(values.id || '')}" 
                   ${isEdit ? 'readonly' : 'required'}
                   pattern="[a-z][a-z0-9_]{1,48}[a-z0-9]"
                   title="3-50 chars, lowercase alphanumeric with underscores">
            ${!isEdit ? '<small>Unique identifier (e.g., "black_morel", "oyster_king")</small>' : '<small>ID cannot be changed after creation</small>'}
          </label>
          <label>
            Common Name
            <input type="text" name="commonName" placeholder="e.g., Black Morel" 
                   value="${escapeHtml(values.commonName || '')}" required>
          </label>
          <label>
            Scientific Name
            <input type="text" name="scientificName" placeholder="e.g., Morchella elata" 
                   value="${escapeHtml(values.scientificName || '')}" required>
          </label>
        </div>
        <label>
          Notes
          <textarea name="notes" rows="3" placeholder="Optional growing notes, substrate preferences, etc.">${escapeHtml(values.notes || '')}</textarea>
        </label>
      </fieldset>

      <div class="grid">
        <fieldset>
          <legend>Incubation Stage</legend>
          <div class="grid">
            <label>
              Temp Min (°C)
              <input type="number" name="incubationTempMin" step="0.1" 
                     value="${values.incubationTempMin ?? 20}" required>
            </label>
            <label>
              Temp Max (°C)
              <input type="number" name="incubationTempMax" step="0.1" 
                     value="${values.incubationTempMax ?? 24}" required>
            </label>
          </div>
          <div class="grid">
            <label>
              Humidity Min (%)
              <input type="number" name="incubationHumidityMin" min="0" max="100" 
                     value="${values.incubationHumidityMin ?? 70}" required>
            </label>
            <label>
              Humidity Max (%)
              <input type="number" name="incubationHumidityMax" min="0" max="100" 
                     value="${values.incubationHumidityMax ?? 85}" required>
            </label>
          </div>
          <div class="grid">
            <label>
              CO₂ Max (ppm)
              <input type="number" name="incubationCo2Max" min="0" 
                     value="${values.incubationCo2Max ?? 5000}" required>
            </label>
            <label>
              FAE Min (exchanges/hr)
              <input type="number" name="incubationFaeMin" min="0" step="0.1" 
                     value="${values.incubationFaeMin ?? 1}" required>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Fruiting Stage</legend>
          <div class="grid">
            <label>
              Temp Min (°C)
              <input type="number" name="fruitingTempMin" step="0.1" 
                     value="${values.fruitingTempMin ?? 18}" required>
            </label>
            <label>
              Temp Max (°C)
              <input type="number" name="fruitingTempMax" step="0.1" 
                     value="${values.fruitingTempMax ?? 22}" required>
            </label>
          </div>
          <div class="grid">
            <label>
              Humidity Min (%)
              <input type="number" name="fruitingHumidityMin" min="0" max="100" 
                     value="${values.fruitingHumidityMin ?? 85}" required>
            </label>
            <label>
              Humidity Max (%)
              <input type="number" name="fruitingHumidityMax" min="0" max="100" 
                     value="${values.fruitingHumidityMax ?? 95}" required>
            </label>
          </div>
          <div class="grid">
            <label>
              CO₂ Max (ppm)
              <input type="number" name="fruitingCo2Max" min="0" 
                     value="${values.fruitingCo2Max ?? 800}" required>
            </label>
            <label>
              FAE Min (exchanges/hr)
              <input type="number" name="fruitingFaeMin" min="0" step="0.1" 
                     value="${values.fruitingFaeMin ?? 4}" required>
            </label>
          </div>
        </fieldset>
      </div>

      <div class="grid">
        <button type="submit">${isEdit ? 'Update Species' : 'Create Species'}</button>
        <a href="${basePath}" role="button" class="secondary">Cancel</a>
      </div>
    </form>
  </article>`;
}

/**
 * Render success message with auto-redirect
 * @param message - Success message to display
 * @param redirectUrl - URL to redirect to after delay
 * @param options - UI configuration options
 * @returns HTML string for success message
 */
export function renderSuccess(message: string, redirectUrl: string, options: UIComponentsOptions = {}): string {
  return `<div class="alert success" hx-trigger="load delay:1s" hx-get="${redirectUrl}" hx-target="main" hx-swap="innerHTML" hx-push-url="true">
    ${escapeHtml(message)} Redirecting...
  </div>`;
}

/** Escape HTML special characters to prevent XSS */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
