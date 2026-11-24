/**
 * Location and Coordinate Geocoding Helper
 * Priority 1: Google Maps Link parsing (extract lat/lng from URL patterns)
 * Priority 2: City & State Geocoding dictionary (prevents stale coordinates on city change)
 */

export interface CoordinateResult {
  lat: number;
  lng: number;
  mapsUrl: string;
  source: 'mapsUrl' | 'city' | 'default';
}

// Comprehensive Coordinates Dictionary for Indian Cities & Tech Hubs
export const KNOWN_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Telangana
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'secunderabad': { lat: 17.4399, lng: 78.4983 },
  'warangal': { lat: 17.9689, lng: 79.5941 },
  'karimnagar': { lat: 18.4386, lng: 79.1288 },
  'nizamabad': { lat: 18.6725, lng: 78.0941 },
  'khammam': { lat: 17.2473, lng: 80.1514 },
  'ramagundam': { lat: 18.7551, lng: 79.5133 },
  'mahbubnagar': { lat: 16.7488, lng: 77.9940 },

  // Andhra Pradesh
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'vizag': { lat: 17.6868, lng: 83.2185 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'guntur': { lat: 16.3067, lng: 80.4365 },
  'guntur-vijayawada': { lat: 16.4300, lng: 80.5500 },
  'guntur vijayawada': { lat: 16.4300, lng: 80.5500 },
  'tirupati': { lat: 13.6288, lng: 79.4192 },
  'rajampet': { lat: 14.1954, lng: 79.1583 },
  'rajampeta': { lat: 14.1954, lng: 79.1583 },
  'rajahmundry': { lat: 17.0005, lng: 81.8040 },
  'kakinada': { lat: 16.9891, lng: 82.2475 },
  'nellore': { lat: 14.4426, lng: 79.9865 },
  'kurnool': { lat: 15.8281, lng: 78.0373 },
  'anantapur': { lat: 14.6819, lng: 77.6006 },
  'kadapa': { lat: 14.4673, lng: 78.8242 },
  'eluru': { lat: 16.7107, lng: 81.0952 },
  'ongole': { lat: 15.5057, lng: 80.0499 },
  'vizianagaram': { lat: 18.1067, lng: 83.3956 },
  'srikakulam': { lat: 18.2949, lng: 83.8938 },

  // Karnataka
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'mysuru': { lat: 12.2958, lng: 76.6394 },
  'mysore': { lat: 12.2958, lng: 76.6394 },
  'hubli': { lat: 15.3647, lng: 75.1240 },
  'hubballi': { lat: 15.3647, lng: 75.1240 },
  'dharwad': { lat: 15.4589, lng: 75.0078 },
  'mangaluru': { lat: 12.9141, lng: 74.8560 },
  'mangalore': { lat: 12.9141, lng: 74.8560 },
  'belagavi': { lat: 15.8497, lng: 74.4977 },
  'belgaum': { lat: 15.8497, lng: 74.4977 },
  'kalaburagi': { lat: 17.3297, lng: 76.8343 },
  'gulbarga': { lat: 17.3297, lng: 76.8343 },

  // Tamil Nadu
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'trichy': { lat: 10.7905, lng: 78.7047 },
  'salem': { lat: 11.6643, lng: 78.1460 },
  'tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'vellore': { lat: 12.9165, lng: 79.1325 },

  // Maharashtra
  'pune': { lat: 18.5204, lng: 73.8567 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'navi mumbai': { lat: 19.0330, lng: 73.0297 },
  'thane': { lat: 19.2183, lng: 72.9781 },

  // Delhi NCR
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'greater noida': { lat: 28.4744, lng: 77.5040 },
  'gurugram': { lat: 28.4595, lng: 77.0266 },
  'gurgaon': { lat: 28.4595, lng: 77.0266 },
  'faridabad': { lat: 28.4089, lng: 77.3178 },
  'ghaziabad': { lat: 28.6692, lng: 77.4538 },

  // Kerala
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'cochin': { lat: 9.9312, lng: 76.2673 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'trivandrum': { lat: 8.5241, lng: 76.9366 },
  'kozhikode': { lat: 11.2588, lng: 75.7804 },
  'calicut': { lat: 11.2588, lng: 75.7804 },

  // Other Major States
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'cuttack': { lat: 20.4625, lng: 85.8828 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'ranchi': { lat: 23.3441, lng: 85.3096 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'raipur': { lat: 21.2514, lng: 81.6296 },
  'panaji': { lat: 15.4909, lng: 73.8278 },
  'goa': { lat: 15.2993, lng: 74.1240 }
};

/**
 * Checks whether latitude and longitude are within valid geographic bounds
 */
export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

/**
 * Priority 1: Extract coordinates from various Google Maps URL patterns
 * Supports:
 * - !3dLAT!4dLNG (standard Google Maps place / embed URLs)
 * - @LAT,LNG (Google Maps view coordinates)
 * - ?q=LAT,LNG or &q=LAT,LNG
 * - ?query=LAT,LNG or &query=LAT,LNG
 * - ?ll=LAT,LNG or &ll=LAT,LNG
 * - Raw coordinate string "LAT, LNG"
 */
export function extractCoordsFromMapsUrl(url: string): { lat: number; lng: number } | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Pattern 1: !3dLAT!4dLNG (standard place detail links)
  const placeMatch = trimmed.match(/!3d(-?\d+(?:\.\d+)?).*?!4d(-?\d+(?:\.\d+)?)/);
  if (placeMatch) {
    const lat = parseFloat(placeMatch[1]);
    const lng = parseFloat(placeMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Pattern 2: @LAT,LNG (view location with optional zoom/pitch)
  const atMatch = trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Pattern 3: ?q=LAT,LNG or &q=LAT,LNG or query= or ll= or center=
  const queryMatch = trimmed.match(/[?&](?:q|query|ll|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Pattern 4: /place/[^/]+/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)
  const pathMatch = trimmed.match(/\/place\/[^/]+\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (pathMatch) {
    const lat = parseFloat(pathMatch[1]);
    const lng = parseFloat(pathMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Pattern 5: Plain coordinates input e.g. "17.3850, 78.4867"
  const plainMatch = trimmed.match(/^[-+]?([0-8]?\d(?:\.\d+)?|90(?:\.0+)?)[,\s]+[-+]?((?:1[0-7]\d|\d{1,2})(?:\.\d+)?|180(?:\.0+)?)$/);
  if (plainMatch) {
    const lat = parseFloat(plainMatch[1]);
    const lng = parseFloat(plainMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

/**
 * Checks if the URL is a shortened Google Maps redirect link
 */
export function isShortMapsUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const lower = url.trim().toLowerCase();
  return (
    lower.includes('maps.app.goo.gl') ||
    lower.includes('goo.gl/maps') ||
    lower.includes('bit.ly') ||
    lower.includes('t.co')
  );
}

/**
 * Priority 2: Geocode city name (and optional state) to accurate coordinates
 * Ensures changing a city (e.g. Hyderabad -> Visakhapatnam) immediately moves coordinates
 */
export function geocodeCity(cityName: string, stateName?: string): { lat: number; lng: number } | null {
  if (!cityName || typeof cityName !== 'string') return null;

  // Clean and normalize city name
  const cleanCity = cityName
    .trim()
    .toLowerCase()
    .replace(/\b(campus|tech center|center|academy|flagship|east|west|north|south|hub|branch)\b/gi, '')
    .replace(/[^a-z\s]/g, '')
    .trim();

  // 1. Direct match in dictionary
  if (KNOWN_CITY_COORDINATES[cleanCity]) {
    return KNOWN_CITY_COORDINATES[cleanCity];
  }

  // 2. Substring matching e.g. "Visakhapatnam Campus" -> "visakhapatnam"
  const cityKeys = Object.keys(KNOWN_CITY_COORDINATES);
  for (const key of cityKeys) {
    if (cleanCity.includes(key) || key.includes(cleanCity)) {
      return KNOWN_CITY_COORDINATES[key];
    }
  }

  // 3. Fallback to state capitals if city not found
  if (stateName) {
    const cleanState = stateName.trim().toLowerCase();
    if (cleanState.includes('telangana')) return KNOWN_CITY_COORDINATES['hyderabad'];
    if (cleanState.includes('andhra')) return KNOWN_CITY_COORDINATES['visakhapatnam'];
    if (cleanState.includes('karnataka')) return KNOWN_CITY_COORDINATES['bengaluru'];
    if (cleanState.includes('tamil')) return KNOWN_CITY_COORDINATES['chennai'];
    if (cleanState.includes('maharashtra')) return KNOWN_CITY_COORDINATES['pune'];
    if (cleanState.includes('kerala')) return KNOWN_CITY_COORDINATES['kochi'];
    if (cleanState.includes('delhi')) return KNOWN_CITY_COORDINATES['delhi'];
    if (cleanState.includes('gujarat')) return KNOWN_CITY_COORDINATES['ahmedabad'];
  }

  // 4. Default India center fallback so NO project is ever dropped
  return { lat: 17.0, lng: 80.0 };
}

/**
 * Priority-Based Coordinate Resolution:
 * Priority 1: Google Maps link (if valid link provided)
 * Priority 2: City & State Geocoding (if mapsUrl is empty or when city changes)
 */
export function resolveProjectCoordinates(params: {
  mapsUrl?: string;
  city?: string;
  state?: string;
  currentLat?: number;
  currentLng?: number;
}): CoordinateResult {
  const rawMapsUrl = (params.mapsUrl || '').trim();
  const city = (params.city || '').trim();
  const state = (params.state || '').trim();

  // Priority 1: Check Google Maps Link
  if (rawMapsUrl) {
    const extracted = extractCoordsFromMapsUrl(rawMapsUrl);
    if (extracted) {
      return {
        lat: extracted.lat,
        lng: extracted.lng,
        mapsUrl: rawMapsUrl,
        source: 'mapsUrl'
      };
    }
    // If it's a short link, keep the URL; coordinates will resolve or fall back to city
    if (isShortMapsUrl(rawMapsUrl)) {
      const cityCoords = geocodeCity(city, state);
      return {
        lat: cityCoords ? cityCoords.lat : (params.currentLat || 17.0),
        lng: cityCoords ? cityCoords.lng : (params.currentLng || 80.0),
        mapsUrl: rawMapsUrl,
        source: 'mapsUrl'
      };
    }
  }

  // Priority 2: Manual City & State Geocoding
  const geocoded = geocodeCity(city, state);
  if (geocoded) {
    const finalUrl = rawMapsUrl || `https://www.google.com/maps?q=${geocoded.lat},${geocoded.lng}`;
    return {
      lat: geocoded.lat,
      lng: geocoded.lng,
      mapsUrl: finalUrl,
      source: 'city'
    };
  }

  // Fallback to current coordinates or default India center [17.0, 80.0]
  const fallbackLat = isValidLatLng(Number(params.currentLat), Number(params.currentLng))
    ? Number(params.currentLat)
    : 17.0;
  const fallbackLng = isValidLatLng(Number(params.currentLat), Number(params.currentLng))
    ? Number(params.currentLng)
    : 80.0;

  return {
    lat: fallbackLat,
    lng: fallbackLng,
    mapsUrl: rawMapsUrl || `https://www.google.com/maps?q=${fallbackLat},${fallbackLng}`,
    source: 'default'
  };
}

export interface PlottedProjectPin<T = any> {
  project: T;
  baseLat: number;
  baseLng: number;
  lat: number;
  lng: number;
  isOffset: boolean;
  clusterSize: number;
}

/**
 * Ensures EVERY project is mapped with valid coordinates and de-overlaps pins
 * that share identical or close coordinates (within 0.01 deg) by arranging them
 * in a neat circular offset (radius ~ 0.06 deg / ~6.6km).
 */
export function deOverlapProjectPins<T extends { lat?: number | string; lng?: number | string; mapsUrl?: string; city?: string; state?: string }>(
  projects: T[],
  offsetRadius: number = 0.06
): PlottedProjectPin<T>[] {
  // Step 1: Assign valid base coordinates to every single project (zero drops)
  const assigned = projects.map((proj) => {
    let lat = Number(proj.lat);
    let lng = Number(proj.lng);

    // Priority 1: Check existing lat/lng or parse mapsUrl
    if (!isValidLatLng(lat, lng) && proj.mapsUrl) {
      const extracted = extractCoordsFromMapsUrl(proj.mapsUrl);
      if (extracted) {
        lat = extracted.lat;
        lng = extracted.lng;
      }
    }

    // Priority 2: City / state geocode fallback
    if (!isValidLatLng(lat, lng)) {
      const geocoded = geocodeCity(proj.city || '', proj.state);
      if (geocoded) {
        lat = geocoded.lat;
        lng = geocoded.lng;
      } else {
        // Default India center fallback [17.0, 80.0]
        lat = 17.0;
        lng = 80.0;
      }
    }

    return { project: proj, baseLat: lat, baseLng: lng };
  });

  // Step 2: Group into clusters of points within 0.01 degrees of each other
  const clusters: { centerLat: number; centerLng: number; items: typeof assigned }[] = [];

  for (const item of assigned) {
    let matchedCluster: typeof clusters[0] | null = null;
    for (const cluster of clusters) {
      const dist = Math.hypot(item.baseLat - cluster.centerLat, item.baseLng - cluster.centerLng);
      if (dist <= 0.01) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      matchedCluster.items.push(item);
    } else {
      clusters.push({
        centerLat: item.baseLat,
        centerLng: item.baseLng,
        items: [item]
      });
    }
  }

  // Step 3: De-overlap clusters with multiple pins using a circular offset
  const result: PlottedProjectPin<T>[] = [];

  for (const cluster of clusters) {
    const count = cluster.items.length;
    if (count === 1) {
      result.push({
        project: cluster.items[0].project,
        baseLat: cluster.items[0].baseLat,
        baseLng: cluster.items[0].baseLng,
        lat: cluster.items[0].baseLat,
        lng: cluster.items[0].baseLng,
        isOffset: false,
        clusterSize: 1
      });
    } else {
      // Multiple projects at the exact same or very close coordinates:
      // Offset them evenly around a circle
      cluster.items.forEach((item, idx) => {
        const angle = (2 * Math.PI * idx) / count - Math.PI / 2; // start from top (12 o'clock)
        const offsetLat = cluster.centerLat + offsetRadius * Math.sin(angle);
        const offsetLng = cluster.centerLng + offsetRadius * Math.cos(angle);
        result.push({
          project: item.project,
          baseLat: item.baseLat,
          baseLng: item.baseLng,
          lat: offsetLat,
          lng: offsetLng,
          isOffset: true,
          clusterSize: count
        });
      });
    }
  }

  return result;
}
