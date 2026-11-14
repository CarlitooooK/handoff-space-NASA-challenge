#!/usr/bin/env node

/**
 * Lunar Landing Site Navigator — Zero-Dependency Mock Server
 *
 * Implements the complete v1.0 API contract for local frontend development,
 * offline hackathon demos, and automated testing without external dependencies.
 *
 * Usage:
 *   node mock/server.js
 *   PORT=3000 node mock/server.js
 */

const http = require('http');
const url = require('url');

const PORT = parseInt(process.env.PORT || '3000', 10);

// ============================================================================
// Curated Polar Sites Catalog
// ============================================================================
const CURATED_SITES = [
  {
    id: 'artemis-shackleton-rim',
    name: 'Shackleton Rim',
    category: 'Artemis III',
    lat: -89.66,
    lon: 222.7,
    polar_x_m: -6975.1,
    polar_y_m: 7569.4,
    elevation_m: 2048.5,
    slope_deg: 6.4,
    nearest_psr_km: 1.8,
    description: 'Cresta con alta iluminación solar continua cerca del cráter Shackleton.'
  },
  {
    id: 'artemis-malapert-mountain',
    name: 'Malapert Mountain (Massif)',
    category: 'Artemis III / CLPS',
    lat: -85.99,
    lon: 357.2,
    polar_x_m: 23512.0,
    polar_y_m: -81204.0,
    elevation_m: 5020.0,
    slope_deg: 8.2,
    nearest_psr_km: 14.2,
    description: 'Macizo prominente con línea de vista directa a la Tierra casi ininterrumpida.'
  },
  {
    id: 'artemis-haworth-edge',
    name: 'Haworth Crater Edge',
    category: 'Artemis III Candidate',
    lat: -87.40,
    lon: 354.8,
    polar_x_m: 12450.0,
    polar_y_m: -42100.0,
    elevation_m: -320.0,
    slope_deg: 7.1,
    nearest_psr_km: 0.8,
    description: 'Borde elevado con proximidad inmediata a depósitos de hielo en el interior del cráter.'
  },
  {
    id: 'artemis-amundsen-rim',
    name: 'Amundsen Rim',
    category: 'Artemis III Candidate',
    lat: -84.50,
    lon: 85.6,
    polar_x_m: 82140.0,
    polar_y_m: 115200.0,
    elevation_m: 1250.0,
    slope_deg: 5.8,
    nearest_psr_km: 6.5,
    description: 'Borde con pendientes suaves de aterrizaje y visibilidad compartida con Tierra.'
  },
  {
    id: 'clps-candidate-ridge',
    name: 'South Pole Connecting Ridge',
    category: 'CLPS / Robotic Lander',
    lat: -88.80,
    lon: 124.0,
    polar_x_m: -18400.0,
    polar_y_m: 31200.0,
    elevation_m: 1850.0,
    slope_deg: 9.1,
    nearest_psr_km: 3.2,
    description: 'Cresta intermedia entre Shackleton y de Gerlache con ventanas solares periódicas.'
  }
];

// ============================================================================
// PSR Database (Permanently Shadowed Regions)
// ============================================================================
const PSR_DATABASE = [
  {
    gid: 14,
    name: 'Shackleton Crater PSR',
    area_km2: 182.4,
    lat: -89.67,
    lon: 129.78,
    polar_x_m: -6500.0,
    polar_y_m: 7200.0,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-6500.0, 7200.0],
            [-6400.0, 7500.0],
            [-6100.0, 7800.0],
            [-5800.0, 7600.0],
            [-5700.0, 7100.0],
            [-6000.0, 6800.0],
            [-6400.0, 6900.0],
            [-6500.0, 7200.0]
          ]
        ]
      ]
    }
  },
  {
    gid: 22,
    name: 'Haworth Crater PSR',
    area_km2: 245.8,
    lat: -87.45,
    lon: 355.20,
    polar_x_m: 12000.0,
    polar_y_m: -41500.0,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [11500.0, -41000.0],
            [12500.0, -40800.0],
            [13200.0, -41800.0],
            [12800.0, -42500.0],
            [11800.0, -42200.0],
            [11500.0, -41000.0]
          ]
        ]
      ]
    }
  },
  {
    gid: 31,
    name: 'Shoemaker Crater PSR',
    area_km2: 320.1,
    lat: -88.10,
    lon: 45.30,
    polar_x_m: 38000.0,
    polar_y_m: 21000.0,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [37500.0, 20500.0],
            [38800.0, 21200.0],
            [39200.0, 22000.0],
            [38100.0, 21800.0],
            [37500.0, 20500.0]
          ]
        ]
      ]
    }
  },
  {
    gid: 45,
    name: 'Faustini Crater PSR',
    area_km2: 198.6,
    lat: -87.30,
    lon: 77.00,
    polar_x_m: 65000.0,
    polar_y_m: 18000.0,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [64500.0, 17500.0],
            [65800.0, 18200.0],
            [66000.0, 19000.0],
            [64900.0, 18700.0],
            [64500.0, 17500.0]
          ]
        ]
      ]
    }
  }
];

// ============================================================================
// Scientific Helper Functions
// ============================================================================

/**
 * Validates lunar coordinates for the South Pole (-90.0 to -80.0 lat).
 */
function validatePolarCoordinates(lat, lon) {
  if (typeof lat !== 'number' || isNaN(lat)) {
    return { valid: false, message: 'La latitud debe ser un valor numérico.' };
  }
  if (lat < -90.0 || lat > -80.0) {
    return {
      valid: false,
      message: `La latitud (${lat}) debe estar en la región polar sur lunar (-90.0 a -80.0 grados).`,
      details: { field: 'lat', value: lat, allowed_range: [-90.0, -80.0] }
    };
  }
  if (typeof lon !== 'number' || isNaN(lon)) {
    return { valid: false, message: 'La longitud debe ser un valor numérico.' };
  }
  return { valid: true };
}

/**
 * Validates date range for ephemeris support (2020-01-01 to 2035-12-31).
 */
function validateDateRange(startUtc) {
  const d = new Date(startUtc);
  if (isNaN(d.getTime())) {
    return { valid: false, message: 'Formato de fecha inválido. Requiere ISO-8601 UTC.' };
  }
  const year = d.getUTCFullYear();
  if (year < 2020 || year > 2035) {
    return {
      valid: false,
      message: `La fecha (${startUtc}) se encuentra fuera de la ventana de efemérides (2020-2035).`,
      details: { field: 'start_utc', value: startUtc, allowed_years: [2020, 2035] }
    };
  }
  return { valid: true, date: d };
}

/**
 * Computes 360-degree azimuthal horizon elevation profile for a given location.
 * Simulates realistic terrain ridge topography around polar craters.
 */
function generateHorizonProfile(lat, lon) {
  const profile = [];
  const seed = Math.abs(lat * 1000 + lon);
  for (let az = 0; az < 360; az++) {
    const rad1 = (az + (seed % 90)) * (Math.PI / 180);
    const rad2 = (az * 3 + seed) * (Math.PI / 180);
    // Baseline horizon elevation between 0.3° and 2.2° with peak ridges
    const elevation = 0.85 + 0.45 * Math.sin(rad1) + 0.25 * Math.cos(rad2) + 0.1 * Math.sin(az * 7 * Math.PI / 180);
    const clampedEl = Math.max(0.1, parseFloat(elevation.toFixed(2)));
    profile.push({ az_deg: az, horizon_el_deg: clampedEl });
  }
  return profile;
}

/**
 * Computes normalized 3D unit vector [x, y, z] from azimuth and elevation.
 * Local frame: +X = East, +Y = Elevation (Up), -Z = North (+Z = South).
 */
function vector3DFromAzEl(azDeg, elDeg) {
  const azRad = azDeg * (Math.PI / 180);
  const elRad = elDeg * (Math.PI / 180);
  const cosEl = Math.cos(elRad);
  const x = parseFloat((cosEl * Math.sin(azRad)).toFixed(3));
  const y = parseFloat(Math.sin(elRad).toFixed(3));
  const z = parseFloat((-cosEl * Math.cos(azRad)).toFixed(3));
  return [x, y, z];
}

/**
 * Generates an elevation and slope grid (DEM patch) centered at (lat, lon).
 */
function generateTerrainPatch(lat, lon, sizeKm = 12.0, resolution = 128) {
  const totalCells = resolution * resolution;
  const cellSizeM = parseFloat(((sizeKm * 1000) / (resolution - 1)).toFixed(2));
  const elevations = new Float32Array(totalCells);
  const slopes = new Float32Array(totalCells);

  // Match closest curated site or use analytical ridge/crater function
  let baseElev = 1800.0;
  for (const s of CURATED_SITES) {
    if (Math.abs(s.lat - lat) < 0.5 && Math.abs(s.lon - lon) < 1.0) {
      baseElev = s.elevation_m;
      break;
    }
  }

  let minElev = Infinity;
  let maxElev = -Infinity;

  const halfN = (resolution - 1) / 2;
  for (let r = 0; r < resolution; r++) {
    for (let c = 0; c < resolution; c++) {
      const idx = r * resolution + c;
      const xNorm = (c - halfN) / halfN; // -1 to 1
      const yNorm = (r - halfN) / halfN; // -1 to 1
      const distFromCenter = Math.sqrt(xNorm * xNorm + yNorm * yNorm);

      // Crater / ridge elevation pattern
      // Central depression + rim peak at dist ~ 0.6 + noise
      const craterBowl = -900.0 * Math.exp(-Math.pow(distFromCenter / 0.55, 2));
      const rimRidge = 450.0 * Math.exp(-Math.pow((distFromCenter - 0.7) / 0.2, 2));
      const microTerrain = 60.0 * Math.sin(xNorm * 12.0) * Math.cos(yNorm * 12.0);

      const elev = parseFloat((baseElev + craterBowl + rimRidge + microTerrain).toFixed(1));
      elevations[idx] = elev;
      if (elev < minElev) minElev = elev;
      if (elev > maxElev) maxElev = elev;

      // Approximate local slope in degrees
      const radialSlope = Math.abs(distFromCenter - 0.7) * 14.0 + Math.abs(craterBowl) * 0.015;
      const localSlope = parseFloat(Math.min(35.0, Math.max(1.2, radialSlope + Math.abs(microTerrain) * 0.1)).toFixed(1));
      slopes[idx] = localSlope;
    }
  }

  // Convert typed arrays to regular JSON arrays
  return {
    size_km: sizeKm,
    resolution,
    cell_size_m: cellSizeM,
    min_elevation_m: parseFloat(minElev.toFixed(1)),
    max_elevation_m: parseFloat(maxElev.toFixed(1)),
    elevations_m: Array.from(elevations),
    slopes_deg: Array.from(slopes)
  };
}

/**
 * Runs the operational landing site evaluation.
 */
function evaluateScenario(params) {
  const {
    lat,
    lon,
    start_utc,
    duration_days = 14.0,
    step_minutes = 60,
    panel_efficiency = 0.28,
    panel_area_m2 = 4.0
  } = params;

  const horizonProfile = generateHorizonProfile(lat, lon);
  const startDate = new Date(start_utc);
  const totalMinutes = duration_days * 24 * 60;
  const numSteps = Math.min(1000, Math.floor(totalMinutes / step_minutes));

  // Determine site baseline properties
  let siteElev = 2048.5;
  let siteSlope = 6.4;
  let nearestPsr = 1.8;
  for (const s of CURATED_SITES) {
    if (Math.abs(s.lat - lat) < 0.2 && Math.abs(s.lon - lon) < 0.5) {
      siteElev = s.elevation_m;
      siteSlope = s.slope_deg;
      nearestPsr = s.nearest_psr_km;
      break;
    }
  }

  const timeline = [];
  let sunVisibleCount = 0;
  let earthVisibleCount = 0;
  let currentSunStreak = 0;
  let maxSunStreak = 0;
  let currentDteStreak = 0;
  let maxDteStreak = 0;
  let nextSunsetUtc = null;
  let hoursToNextSunset = null;
  let nextEarthsetUtc = null;
  let hoursToNextEarthset = null;
  let powerFactorSum = 0;

  // Synodic lunar day ~ 708.73 hours; libration cycle ~ 27.32 days
  const startHoursEpoch = startDate.getTime() / (3600 * 1000);

  for (let i = 0; i < numSteps; i++) {
    const elapsedMinutes = i * step_minutes;
    const elapsedHours = elapsedMinutes / 60;
    const stepDate = new Date(startDate.getTime() + elapsedMinutes * 60 * 1000);
    const timestampUtc = stepDate.toISOString();

    // Solar ephemeris calculation
    const sunAzProgress = ((startHoursEpoch + elapsedHours) / 708.73) * 360;
    const sunAzDeg = parseFloat(((sunAzProgress + lon + 180) % 360).toFixed(2));
    // Polar solar elevation oscillates between ~1.2° and ~1.9°
    const sunElDeg = parseFloat((1.55 + 0.35 * Math.sin(((startHoursEpoch + elapsedHours) / 8760) * 2 * Math.PI)).toFixed(2));

    const sunAzIndex = Math.min(359, Math.max(0, Math.round(sunAzDeg)));
    const sunHorizonEl = horizonProfile[sunAzIndex].horizon_el_deg;
    const sunVisible = sunElDeg > sunHorizonEl;

    // Earth ephemeris calculation (near horizon with ~27.3 day libration cycle)
    const earthLibrationRad = ((startHoursEpoch + elapsedHours) / (27.32 * 24)) * 2 * Math.PI;
    const earthAzDeg = parseFloat(((140.0 + 4.5 * Math.cos(earthLibrationRad) + (lon * 0.1)) % 360).toFixed(2));
    const earthElDeg = parseFloat((-0.5 + 2.8 * Math.sin(earthLibrationRad)).toFixed(2));

    const earthAzIndex = Math.min(359, Math.max(0, Math.round(earthAzDeg)));
    const earthHorizonEl = horizonProfile[earthAzIndex].horizon_el_deg;
    const earthVisible = earthElDeg > earthHorizonEl;

    // Power calculation
    let powerFactor = 0;
    if (sunVisible && sunElDeg > 0) {
      powerFactor = parseFloat((Math.sin(sunElDeg * (Math.PI / 180)) * 28.0).toFixed(2));
    }
    powerFactorSum += powerFactor;

    // Tracking streaks and events
    if (sunVisible) {
      sunVisibleCount++;
      currentSunStreak += step_minutes / 60;
      if (currentSunStreak > maxSunStreak) maxSunStreak = currentSunStreak;
    } else {
      if (currentSunStreak > 0 && nextSunsetUtc === null) {
        nextSunsetUtc = timestampUtc;
        hoursToNextSunset = parseFloat(elapsedHours.toFixed(1));
      }
      currentSunStreak = 0;
    }

    if (earthVisible) {
      earthVisibleCount++;
      currentDteStreak += step_minutes / 60;
      if (currentDteStreak > maxDteStreak) maxDteStreak = currentDteStreak;
    } else {
      if (currentDteStreak > 0 && nextEarthsetUtc === null) {
        nextEarthsetUtc = timestampUtc;
        hoursToNextEarthset = parseFloat(elapsedHours.toFixed(1));
      }
      currentDteStreak = 0;
    }

    timeline.push({
      timestamp_utc: timestampUtc,
      sun_az_deg: sunAzDeg,
      sun_el_deg: sunElDeg,
      sun_horizon_el_deg: sunHorizonEl,
      sun_visible: sunVisible,
      sun_vector_3d: vector3DFromAzEl(sunAzDeg, sunElDeg),
      earth_az_deg: earthAzDeg,
      earth_el_deg: earthElDeg,
      earth_horizon_el_deg: earthHorizonEl,
      earth_visible: earthVisible,
      earth_vector_3d: vector3DFromAzEl(earthAzDeg, earthElDeg),
      power_factor: powerFactor
    });
  }

  const sunVisiblePct = parseFloat(((sunVisibleCount / numSteps) * 100).toFixed(1));
  const earthVisiblePct = parseFloat(((earthVisibleCount / numSteps) * 100).toFixed(1));
  const avgPowerFactor = parseFloat((powerFactorSum / numSteps).toFixed(2));
  const solarFluxWatts = 1361.0; // W/m^2 solar constant
  const estimatedPeakPowerW = parseFloat((solarFluxWatts * panel_efficiency * panel_area_m2).toFixed(1));

  // Determine GO / NO-GO status
  const reasons = [];
  let isGo = true;

  if (siteSlope <= 10.0) {
    reasons.push(`Pendiente segura (${siteSlope}° <= 10.0° límite operativo)`);
  } else {
    isGo = false;
    reasons.push(`Pendiente excesiva (${siteSlope}° > 10.0° límite de seguridad)`);
  }

  if (sunVisiblePct >= 70.0) {
    reasons.push(`Iluminación solar alta (${sunVisiblePct}% en la ventana seleccionada)`);
  } else {
    isGo = false;
    reasons.push(`Iluminación solar insuficiente (${sunVisiblePct}% < 70.0% mínimo requerido)`);
  }

  if (earthVisiblePct >= 50.0) {
    reasons.push(`Comunicación Direct-to-Earth disponible (${earthVisiblePct}%)`);
  } else {
    isGo = false;
    reasons.push(`Ventana de enlace DTE crítica (${earthVisiblePct}% < 50.0% mínimo)`);
  }

  return {
    site: {
      lat,
      lon,
      elevation_m: siteElev,
      slope_deg: siteSlope,
      nearest_psr_km: nearestPsr,
      status: isGo ? 'GO' : 'NO-GO',
      reasons
    },
    summary: {
      sun_visible_pct: sunVisiblePct,
      earth_visible_pct: earthVisiblePct,
      max_continuous_sun_hours: parseFloat(maxSunStreak.toFixed(1)),
      max_continuous_dte_hours: parseFloat(maxDteStreak.toFixed(1)),
      next_sunset_utc: nextSunsetUtc || new Date(startDate.getTime() + totalMinutes * 60000).toISOString(),
      hours_to_next_sunset: hoursToNextSunset !== null ? hoursToNextSunset : parseFloat((duration_days * 24).toFixed(1)),
      next_earthset_utc: nextEarthsetUtc || new Date(startDate.getTime() + totalMinutes * 60000).toISOString(),
      hours_to_next_earthset: hoursToNextEarthset !== null ? hoursToNextEarthset : parseFloat((duration_days * 24).toFixed(1)),
      avg_power_factor: avgPowerFactor,
      estimated_peak_power_w: estimatedPeakPowerW
    },
    horizon_profile: horizonProfile,
    timeline
  };
}

// ============================================================================
// HTTP Server & Router
// ============================================================================

function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(json);
}

function sendError(res, statusCode, code, message, details = null) {
  const payload = {
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
  sendJson(res, statusCode, payload);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        // 5 MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  try {
    // ------------------------------------------------------------------------
    // GET /api/v1/health
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/health' && method === 'GET') {
      sendJson(res, 200, {
        status: 'ok',
        database: {
          landing_sites_count: CURATED_SITES.length,
          psr_regions_count: PSR_DATABASE.length
        }
      });
      return;
    }

    // ------------------------------------------------------------------------
    // GET /api/v1/sites
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/sites' && method === 'GET') {
      sendJson(res, 200, {
        count: CURATED_SITES.length,
        sites: CURATED_SITES
      });
      return;
    }

    // ------------------------------------------------------------------------
    // GET /api/v1/terrain/patch
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/terrain/patch' && method === 'GET') {
      const q = parsedUrl.query;
      const lat = parseFloat(q.lat);
      const lon = parseFloat(q.lon);
      const sizeKm = q.size_km ? parseFloat(q.size_km) : 12.0;
      const resolution = q.resolution ? parseInt(q.resolution, 10) : 128;

      const coordCheck = validatePolarCoordinates(lat, lon);
      if (!coordCheck.valid) {
        sendError(res, 422, 'ERR_INVALID_COORDINATES', coordCheck.message, coordCheck.details);
        return;
      }

      if (![64, 128, 256].includes(resolution)) {
        sendError(res, 422, 'ERR_INVALID_PAYLOAD', 'La resolución debe ser 64, 128 o 256.');
        return;
      }

      const grid = generateTerrainPatch(lat, lon, sizeKm, resolution);
      const patchResponse = {
        center: {
          lat,
          lon,
          polar_x_m: parseFloat((-6975.1 * (lat / -89.66)).toFixed(1)),
          polar_y_m: parseFloat((7569.4 * (lon / 222.7)).toFixed(1)),
          elevation_m: grid.elevations_m[Math.floor(grid.elevations_m.length / 2)],
          slope_deg: grid.slopes_deg[Math.floor(grid.slopes_deg.length / 2)]
        },
        grid,
        nearby_psrs: [
          {
            gid: 14,
            name: 'Shackleton Crater PSR',
            area_km2: 182.4,
            distance_km: 1.8
          }
        ]
      };

      sendJson(res, 200, patchResponse);
      return;
    }

    // ------------------------------------------------------------------------
    // POST /api/v1/evaluate
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/evaluate' && method === 'POST') {
      let body;
      try {
        body = await parseJsonBody(req);
      } catch {
        sendError(res, 400, 'ERR_INVALID_PAYLOAD', 'Cuerpo de petición JSON inválido o malformado.');
        return;
      }

      const { lat, lon, start_utc } = body;
      if (lat === undefined || lon === undefined || !start_utc) {
        sendError(res, 400, 'ERR_INVALID_PAYLOAD', 'Campos obligatorios requeridos: lat, lon, start_utc.');
        return;
      }

      const coordCheck = validatePolarCoordinates(parseFloat(lat), parseFloat(lon));
      if (!coordCheck.valid) {
        sendError(res, 422, 'ERR_INVALID_COORDINATES', coordCheck.message, coordCheck.details);
        return;
      }

      const dateCheck = validateDateRange(start_utc);
      if (!dateCheck.valid) {
        sendError(res, 422, 'ERR_DATE_OUT_OF_RANGE', dateCheck.message, dateCheck.details);
        return;
      }

      const evalResult = evaluateScenario({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        start_utc,
        duration_days: body.duration_days ? parseFloat(body.duration_days) : 14.0,
        step_minutes: body.step_minutes ? parseInt(body.step_minutes, 10) : 60,
        panel_efficiency: body.panel_efficiency ? parseFloat(body.panel_efficiency) : 0.28,
        panel_area_m2: body.panel_area_m2 ? parseFloat(body.panel_area_m2) : 4.0
      });

      sendJson(res, 200, evalResult);
      return;
    }

    // ------------------------------------------------------------------------
    // POST /api/v1/compare
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/compare' && method === 'POST') {
      let body;
      try {
        body = await parseJsonBody(req);
      } catch {
        sendError(res, 400, 'ERR_INVALID_PAYLOAD', 'Cuerpo de petición JSON inválido o malformado.');
        return;
      }

      const { scenarios, duration_days = 14.0, step_minutes = 120 } = body;
      if (!Array.isArray(scenarios) || scenarios.length < 2 || scenarios.length > 5) {
        sendError(
          res,
          422,
          'ERR_SCENARIO_LIMIT_EXCEEDED',
          'El análisis comparativo requiere entre 2 y 5 escenarios simultáneos.'
        );
        return;
      }

      // Check duplicates
      const signatureSet = new Set();
      for (const sc of scenarios) {
        const sig = `${sc.lat}_${sc.lon}_${sc.start_utc}`;
        if (signatureSet.has(sig)) {
          sendError(
            res,
            422,
            'ERR_DUPLICATE_SCENARIOS',
            `Se detectó un escenario duplicado (lat: ${sc.lat}, lon: ${sc.lon}, fecha: ${sc.start_utc}).`
          );
          return;
        }
        signatureSet.add(sig);

        const cCheck = validatePolarCoordinates(parseFloat(sc.lat), parseFloat(sc.lon));
        if (!cCheck.valid) {
          sendError(res, 422, 'ERR_INVALID_COORDINATES', `Escenario "${sc.label}": ${cCheck.message}`, cCheck.details);
          return;
        }

        const dCheck = validateDateRange(sc.start_utc);
        if (!dCheck.valid) {
          sendError(res, 422, 'ERR_DATE_OUT_OF_RANGE', `Escenario "${sc.label}": ${dCheck.message}`, dCheck.details);
          return;
        }
      }

      const results = scenarios.map(sc => {
        const ev = evaluateScenario({
          lat: parseFloat(sc.lat),
          lon: parseFloat(sc.lon),
          start_utc: sc.start_utc,
          duration_days: parseFloat(duration_days),
          step_minutes: parseInt(step_minutes, 10)
        });
        return {
          label: sc.label || `Lat ${sc.lat}, Lon ${sc.lon}`,
          site: ev.site,
          summary: ev.summary
        };
      });

      sendJson(res, 200, { results });
      return;
    }

    // ------------------------------------------------------------------------
    // GET /api/v1/psr/nearby
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/psr/nearby' && method === 'GET') {
      const q = parsedUrl.query;
      const lat = parseFloat(q.lat);
      const lon = parseFloat(q.lon);
      const radiusKm = q.radius_km ? parseFloat(q.radius_km) : 25.0;

      const coordCheck = validatePolarCoordinates(lat, lon);
      if (!coordCheck.valid) {
        sendError(res, 422, 'ERR_INVALID_COORDINATES', coordCheck.message, coordCheck.details);
        return;
      }

      // Filter PSRs by distance
      const nearbyPsrs = PSR_DATABASE.filter(p => {
        const dLat = (p.lat - lat) * 111.0;
        const dLon = (p.lon - lon) * (111.0 * Math.cos(lat * Math.PI / 180));
        const distKm = Math.sqrt(dLat * dLat + dLon * dLon);
        return distKm <= radiusKm * 2.5; // Include prominent polar features
      }).map(p => ({
        gid: p.gid,
        name: p.name,
        area_km2: p.area_km2,
        distance_km: parseFloat(Math.max(0.5, Math.abs(p.lat - lat) * 30.0).toFixed(1)),
        geometry: p.geometry
      }));

      sendJson(res, 200, {
        center: {
          lat,
          lon,
          polar_x_m: parseFloat((-6975.1 * (lat / -89.66)).toFixed(1)),
          polar_y_m: parseFloat((7569.4 * (lon / 222.7)).toFixed(1))
        },
        radius_km: radiusKm,
        count: nearbyPsrs.length,
        psrs: nearbyPsrs
      });
      return;
    }

    // ------------------------------------------------------------------------
    // Route Not Found
    // ------------------------------------------------------------------------
    sendError(res, 404, 'ERR_NOT_FOUND', `Ruta no encontrada: ${method} ${pathname}`);
  } catch (err) {
    console.error('Unhandled server error:', err);
    sendError(res, 500, 'ERR_INTERNAL_SERVER', 'Error interno al procesar la solicitud en el servidor mock.');
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log('============================================================');
    console.log('  Lunar Landing Navigator — Zero-Dependency Mock Server');
    console.log(`  Listening on http://localhost:${PORT}`);
    console.log('============================================================');
    console.log('Available endpoints:');
    console.log('  GET  /api/v1/health');
    console.log('  GET  /api/v1/sites');
    console.log('  GET  /api/v1/terrain/patch?lat=-89.66&lon=222.7');
    console.log('  POST /api/v1/evaluate');
    console.log('  POST /api/v1/compare');
    console.log('  GET  /api/v1/psr/nearby?lat=-89.66&lon=222.7');
    console.log('============================================================');
  });
}

module.exports = {
  server,
  CURATED_SITES,
  PSR_DATABASE,
  evaluateScenario,
  generateTerrainPatch,
  generateHorizonProfile,
  validatePolarCoordinates,
  validateDateRange
};

