#!/usr/bin/env node

/**
 * Lunar Landing Site Navigator — Zero-Dependency Mock Server
 *
 * Implements the complete v1.2 API contract for local frontend development,
 * offline hackathon demos, and automated testing without external dependencies.
 *
 * Usage:
 *   node mock/server.js
 *   PORT=3000 node mock/server.js
 */

const http = require('http');
const url = require('url');

const PORT = parseInt(process.env.PORT || '3000', 10);
const MOON_RADIUS_M = 1737400.0;

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
    polar_x_m: -6991.8,
    polar_y_m: -7576.9,
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
    polar_x_m: -5942.4,
    polar_y_m: 121501.1,
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
    polar_x_m: -7146.8,
    polar_y_m: 78529.7,
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
    polar_x_m: 166414.7,
    polar_y_m: 12804.9,
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
    polar_x_m: 30168.1,
    polar_y_m: -20348.7,
    elevation_m: 1850.0,
    slope_deg: 9.1,
    nearest_psr_km: 3.2,
    description: 'Cresta intermedia entre Shackleton y de Gerlache con ventanas solares periódicas.'
  },
  {
    id: 'apollo-11',
    name: 'Apollo 11',
    category: 'Apollo',
    lat: 0.674,
    lon: 23.473,
    polar_x_m: 1400449.5,
    polar_y_m: 3224968.5,
    elevation_m: -1925.5,
    slope_deg: 0.8,
    nearest_psr_km: 3154.8,
    description: 'Sitio histórico de alunizaje de Apollo 11 en Mare Tranquillitatis (referencia ecuatorial global).'
  },
  {
    id: 'apollo-15',
    name: 'Apollo 15',
    category: 'Apollo',
    lat: 26.132,
    lon: 3.634,
    polar_x_m: 353366.6,
    polar_y_m: 5563912.6,
    elevation_m: -1924.7,
    slope_deg: 1.0,
    nearest_psr_km: 5266.9,
    description: 'Sitio histórico de Apollo 15 junto a Hadley Rille y los Montes Apeninos (referencia de latitud media norte).'
  },
  {
    id: 'apollo-17',
    name: 'Apollo 17',
    category: 'Apollo',
    lat: 20.191,
    lon: 30.772,
    polar_x_m: 2547972.5,
    polar_y_m: 4279016.6,
    elevation_m: -2624.9,
    slope_deg: 1.1,
    nearest_psr_km: 4608.6,
    description: 'Sitio histórico de Apollo 17 en el valle Taurus-Littrow (referencia global de comparación).'
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
    polar_x_m: 7690.2,
    polar_y_m: -6402.7,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [7690.2, -6402.7],
            [7790.2, -6102.7],
            [8090.2, -5802.7],
            [8390.2, -6002.7],
            [8490.2, -6502.7],
            [8190.2, -6802.7],
            [7790.2, -6702.7],
            [7690.2, -6402.7]
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
    polar_x_m: -6471.4,
    polar_y_m: 77066.1,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-6971.4, 77566.1],
            [-5971.4, 77766.1],
            [-5271.4, 76766.1],
            [-5671.4, 76066.1],
            [-6671.4, 76366.1],
            [-6971.4, 77566.1]
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
    polar_x_m: 40956.0,
    polar_y_m: 40529.4,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [40456.0, 40029.4],
            [41756.0, 40729.4],
            [42156.0, 41529.4],
            [41056.0, 41329.4],
            [40456.0, 40029.4]
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
    polar_x_m: 79789.4,
    polar_y_m: 18420.8,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [79289.4, 17920.8],
            [80589.4, 18620.8],
            [80789.4, 19420.8],
            [79689.4, 19120.8],
            [79289.4, 17920.8]
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
 * Projects lat/lon to LOLA south polar stereographic metres
 * (+proj=stere +lat_0=-90 +lon_0=0 +R=1737400): +X toward 90° E, +Y toward 0° E.
 */
function latLonToPolarXY(lat, lon) {
  const r = 2.0 * MOON_RADIUS_M * Math.tan(((90.0 + lat) * Math.PI) / 360.0);
  const lonRad = (lon * Math.PI) / 180.0;
  return [
    parseFloat((r * Math.sin(lonRad)).toFixed(1)),
    parseFloat((r * Math.cos(lonRad)).toFixed(1))
  ];
}

/**
 * Validates lunar coordinates across the full Moon (-90.0 to 90.0 lat, -180.0 to 360.0 lon).
 */
function validatePolarCoordinates(lat, lon) {
  if (typeof lat !== 'number' || isNaN(lat)) {
    return { valid: false, message: 'La latitud debe ser un valor numérico.' };
  }
  if (lat < -90.0 || lat > 90.0) {
    return {
      valid: false,
      message: `La latitud (${lat}) debe estar en el rango lunar válido (-90.0 a 90.0 grados).`,
      details: { field: 'lat', value: lat, allowed_range: [-90.0, 90.0] }
    };
  }
  if (typeof lon !== 'number' || isNaN(lon)) {
    return { valid: false, message: 'La longitud debe ser un valor numérico.' };
  }
  if (lon < -180.0 || lon > 360.0) {
    return {
      valid: false,
      message: `La longitud (${lon}) debe estar entre -180.0 y 360.0 grados.`,
      details: { field: 'lon', value: lon, allowed_range: [-180.0, 360.0] }
    };
  }
  return { valid: true };
}

/**
 * Validates date range for ephemeris support (1900-01-01 to 2050-12-31).
 */
function validateDateRange(startUtc) {
  const d = new Date(startUtc);
  if (isNaN(d.getTime())) {
    return { valid: false, message: 'Formato de fecha inválido. Requiere ISO-8601 UTC.' };
  }
  const year = d.getUTCFullYear();
  if (year < 1900 || year > 2050) {
    return {
      valid: false,
      message: `La fecha (${startUtc}) se encuentra fuera de la ventana de efemérides (1900-2050).`,
      details: { field: 'start_utc', value: startUtc, allowed_years: [1900, 2050] }
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
    slopes_deg: Array.from(slopes),
    source: 'synthetic',
    native_resolution_m: null
  };
}

/**
 * GO / CAUTION / NO-GO verdict, Spanish `reasons` and machine-readable `checks`
 * (contract v1.2, section 2.4), mirroring the backend thresholds.
 */
function computeStatusAndChecks(slopeDeg, sunPct, earthPct) {
  const reasons = [];
  const checks = [];
  let nogo = false;
  let caution = false;
  const check = (code, level, value, threshold, unit, message) =>
    checks.push({ code, level, value: parseFloat(Number(value).toFixed(2)), threshold, unit, message });
  const s1 = slopeDeg.toFixed(1);
  const p1 = (v) => v.toFixed(1);

  if (slopeDeg > 15.0) {
    nogo = true;
    reasons.push(`Pendiente crítica (${s1}° > 15.0° límite máximo de alunizaje)`);
    check('SLOPE_CRITICAL', 'nogo', slopeDeg, 15.0, 'deg', `Critical slope (${s1}° > 15° landing limit)`);
  } else if (slopeDeg > 10.0) {
    caution = true;
    reasons.push(`Pendiente moderada (${s1}° entre 10° y 15°, requiere control de descenso)`);
    check('SLOPE_MODERATE', 'caution', slopeDeg, 10.0, 'deg', `Moderate slope (${s1}°, between 10° and 15°); needs descent control`);
  } else {
    reasons.push(`Pendiente segura (${s1}° <= 10.0°)`);
    check('SLOPE_SAFE', 'ok', slopeDeg, 10.0, 'deg', `Safe slope (${s1}° ≤ 10°)`);
  }

  if (sunPct < 20.0) {
    nogo = true;
    reasons.push(`Iluminación solar crítica (${p1(sunPct)}% < 20% en la ventana)`);
    check('SUN_CRITICAL', 'nogo', sunPct, 20.0, 'pct', `Critical sunlight (${p1(sunPct)}% < 20% of the window)`);
  } else if (sunPct < 50.0) {
    caution = true;
    reasons.push(`Iluminación solar limitada (${p1(sunPct)}%) en la ventana seleccionada`);
    check('SUN_LIMITED', 'caution', sunPct, 50.0, 'pct', `Limited sunlight (${p1(sunPct)}% of the window)`);
  } else {
    reasons.push(`Iluminación solar alta (${p1(sunPct)}%) en la ventana seleccionada`);
    check('SUN_HIGH', 'ok', sunPct, 50.0, 'pct', `High sunlight (${p1(sunPct)}% of the window)`);
  }

  if (earthPct <= 0.0) {
    caution = true;
    reasons.push('Sin línea de vista Direct-to-Earth (0.0%); requiere satélite relay');
    check('DTE_NONE', 'caution', earthPct, 0.0, 'pct', 'No direct-to-Earth line of sight (0%); needs a relay satellite');
  } else if (earthPct < 15.0) {
    caution = true;
    reasons.push(`Ventana Direct-to-Earth reducida (${p1(earthPct)}% < 15%); considerar relay`);
    check('DTE_REDUCED', 'caution', earthPct, 15.0, 'pct', `Reduced direct-to-Earth window (${p1(earthPct)}% < 15%); consider a relay`);
  } else {
    reasons.push(`Comunicación Direct-to-Earth disponible (${p1(earthPct)}%)`);
    check('DTE_AVAILABLE', 'ok', earthPct, 15.0, 'pct', `Direct-to-Earth link available (${p1(earthPct)}% of the window)`);
  }

  const status = nogo ? 'NO-GO' : caution ? 'CAUTION' : 'GO';
  return { status, reasons, checks };
}

/**
 * Inverse of latLonToPolarXY (LOLA south polar stereographic, D-012).
 */
function polarXYToLatLon(x, y) {
  const r = Math.hypot(x, y);
  const lat = (2.0 * Math.atan(r / (2.0 * MOON_RADIUS_M))) * (180.0 / Math.PI) - 90.0;
  const lon = ((Math.atan2(x, y) * 180.0) / Math.PI + 360.0) % 360.0;
  return [lat, lon];
}

/**
 * Simulated moon-centered ephemeris (contract v1.2, GET /ephemeris).
 * Anchored to the backend's SPICE result for 2026-12-01T00:00:00Z; the sub-solar
 * point drifts west one turn per synodic month and the sub-Earth point librates.
 * Shapes match the backend, values are approximate (mock only).
 */
function simulatedEphemeris(date) {
  const deg = Math.PI / 180.0;
  const days = (date.getTime() - Date.UTC(2026, 11, 1)) / 86400000.0;
  const unit = (latDeg, lonDeg) => [
    parseFloat((Math.cos(latDeg * deg) * Math.cos(lonDeg * deg)).toFixed(6)),
    parseFloat((Math.cos(latDeg * deg) * Math.sin(lonDeg * deg)).toFixed(6)),
    parseFloat(Math.sin(latDeg * deg).toFixed(6))
  ];
  const sunLon = (((280.0638 - (360.0 * days) / 29.530589) % 360.0) + 360.0) % 360.0;
  const sunLat = -1.4708 * Math.cos((2.0 * Math.PI * days) / 346.62);
  const earthLon = (((6.6695 * Math.cos((2.0 * Math.PI * days) / 27.5546)) % 360.0) + 360.0) % 360.0;
  const earthLat = 1.3459 * Math.cos((2.0 * Math.PI * days) / 27.2122);
  const earthDist = 384400.0 - 7883.0 * Math.cos((2.0 * Math.PI * days) / 27.5546);
  const body = (lat, lon, dist) => ({
    direction: unit(lat, lon),
    sub_lat_deg: parseFloat(lat.toFixed(4)),
    sub_lon_deg: parseFloat(lon.toFixed(4)),
    distance_km: parseFloat(dist.toFixed(1))
  });
  return {
    utc: date.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    frame: 'MOON_ME_DE421',
    sun: body(sunLat, sunLon, 147553142.2),
    earth: body(earthLat, earthLon, earthDist)
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

  // Verdict with the same thresholds and codes as the backend (contract v1.2, site.checks).
  const { status, reasons, checks } = computeStatusAndChecks(siteSlope, sunVisiblePct, earthVisiblePct);

  return {
    site: {
      lat,
      lon,
      elevation_m: siteElev,
      slope_deg: siteSlope,
      nearest_psr_km: nearestPsr,
      status,
      reasons,
      checks
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

// Contract v1.2: successful GETs of reference data are cacheable for one hour.
const CACHEABLE_GET_PATHS = new Set([
  '/api/v1/sites', '/api/v1/terrain/patch', '/api/v1/psr', '/api/v1/psr/nearby', '/api/v1/ephemeris'
]);

function sendJson(res, statusCode, data, cacheable = false) {
  const json = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...(cacheable && statusCode === 200 ? { 'Cache-Control': 'public, max-age=3600' } : {})
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
      }, true);
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
          polar_x_m: latLonToPolarXY(lat, lon)[0],
          polar_y_m: latLonToPolarXY(lat, lon)[1],
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

      sendJson(res, 200, patchResponse, true);
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

      const { scenarios, duration_days = 14.0, step_minutes = 120, include_timeline = false } = body;
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
          summary: ev.summary,
          timeline: include_timeline === true ? ev.timeline : null
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
          polar_x_m: latLonToPolarXY(lat, lon)[0],
          polar_y_m: latLonToPolarXY(lat, lon)[1]
        },
        radius_km: radiusKm,
        count: nearbyPsrs.length,
        psrs: nearbyPsrs
      }, true);
      return;
    }

    // ------------------------------------------------------------------------
    // GET /api/v1/psr (contract v1.2: whole catalog, paginated)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/psr' && method === 'GET') {
      const q = parsedUrl.query;
      const simplifyM = q.simplify_m !== undefined ? parseFloat(q.simplify_m) : 500.0;
      const limit = q.limit !== undefined ? parseInt(q.limit, 10) : 500;
      const offset = q.offset !== undefined ? parseInt(q.offset, 10) : 0;
      const minArea = q.min_area_km2 !== undefined ? parseFloat(q.min_area_km2) : 0.0;
      if (!(simplifyM >= 0 && simplifyM <= 5000) || !(limit >= 1 && limit <= 500) || !(offset >= 0) || !(minArea >= 0)) {
        sendError(res, 422, 'ERR_INVALID_PAYLOAD', 'Parámetros fuera de rango: simplify_m 0..5000, limit 1..500, offset >= 0, min_area_km2 >= 0.');
        return;
      }
      const matching = PSR_DATABASE.filter(p => p.area_km2 >= minArea).sort((a, b) => a.gid - b.gid);
      const page = matching.slice(offset, offset + limit).map(p => {
        const [labelLat, labelLon] = polarXYToLatLon(p.polar_x_m, p.polar_y_m);
        return {
          gid: p.gid,
          name: p.name,
          area_km2: p.area_km2,
          label_point: { polar_x_m: p.polar_x_m, polar_y_m: p.polar_y_m, lat: labelLat, lon: labelLon },
          geometry: p.geometry
        };
      });
      sendJson(res, 200, {
        total: matching.length,
        offset,
        limit,
        count: page.length,
        simplify_m: simplifyM,
        psrs: page
      }, true);
      return;
    }

    // ------------------------------------------------------------------------
    // GET /api/v1/ephemeris (contract v1.2: Sun and Earth from the Moon's center)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/ephemeris' && method === 'GET') {
      const utc = parsedUrl.query.utc;
      if (!utc) {
        sendError(res, 422, 'ERR_INVALID_PAYLOAD', 'Parámetro obligatorio requerido: utc (ISO-8601 UTC).');
        return;
      }
      const dateCheck = validateDateRange(utc);
      if (!dateCheck.valid) {
        const code = dateCheck.details ? 'ERR_DATE_OUT_OF_RANGE' : 'ERR_INVALID_PAYLOAD';
        sendError(res, 422, code, dateCheck.message, dateCheck.details);
        return;
      }
      sendJson(res, 200, simulatedEphemeris(dateCheck.date), true);
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
    console.log('  GET  /api/v1/psr?offset=0&limit=500');
    console.log('  GET  /api/v1/ephemeris?utc=2026-12-01T00:00:00Z');
    console.log('============================================================');
  });
}

module.exports = {
  server,
  CURATED_SITES,
  PSR_DATABASE,
  evaluateScenario,
  computeStatusAndChecks,
  simulatedEphemeris,
  generateTerrainPatch,
  generateHorizonProfile,
  validatePolarCoordinates,
  validateDateRange
};

