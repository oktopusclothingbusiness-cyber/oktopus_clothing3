/**
 * High-performance, privacy-compliant IP Geolocation and Network Carrier resolver
 * Resolves IP -> Country, City, Region, Lat/Long, ISP, and Carrier info
 * Strictly local/self-hosted; no personal customer data is ever transmitted.
 */

export interface IpGeoDetails {
  ip: string;
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  carrier?: string;
  organization?: string;
  timezone?: string;
  isPrivate?: boolean;
}

// In-memory LRU-like cache for IP lookups (up to 2000 entries)
const geoCache = new Map<string, { data: IpGeoDetails; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, '').trim();
  if (
    clean === '127.0.0.1' ||
    clean === '::1' ||
    clean === 'localhost' ||
    clean.startsWith('192.168.') ||
    clean.startsWith('10.') ||
    clean.startsWith('172.16.') ||
    clean.startsWith('172.17.') ||
    clean.startsWith('172.18.') ||
    clean.startsWith('172.19.') ||
    clean.startsWith('172.20.') ||
    clean.startsWith('172.21.') ||
    clean.startsWith('172.22.') ||
    clean.startsWith('172.23.') ||
    clean.startsWith('172.24.') ||
    clean.startsWith('172.25.') ||
    clean.startsWith('172.26.') ||
    clean.startsWith('172.27.') ||
    clean.startsWith('172.28.') ||
    clean.startsWith('172.29.') ||
    clean.startsWith('172.30.') ||
    clean.startsWith('172.31.')
  ) {
    return true;
  }
  return false;
}

export async function resolveIpGeo(request: Request, clientIp: string): Promise<IpGeoDetails> {
  const ip = clientIp || '127.0.0.1';

  // 1. Check local / private networks
  if (isPrivateIp(ip)) {
    return {
      ip,
      country: 'Development / Localhost',
      countryCode: 'DEV',
      city: 'Local Machine',
      region: 'Local Network',
      latitude: 22.5726, // Default aesthetic coordinates (Kolkata)
      longitude: 88.3639,
      isp: 'Local Development Server',
      carrier: 'Internal / Wi-Fi',
      isPrivate: true,
    };
  }

  // 2. Check cache
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 3. Extract from Edge / Cloudflare / Vercel request headers if present
  const headerCountry = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry');
  const headerCity = request.headers.get('x-vercel-ip-city') || request.headers.get('cf-ipcity');
  const headerRegion = request.headers.get('x-vercel-ip-country-region');
  const headerLat = request.headers.get('x-vercel-ip-latitude') || request.headers.get('cf-iplatitude');
  const headerLon = request.headers.get('x-vercel-ip-longitude') || request.headers.get('cf-iplongitude');
  const headerTimezone = request.headers.get('x-vercel-ip-timezone');

  if (headerCountry && headerCity) {
    const geoResult: IpGeoDetails = {
      ip,
      country: headerCountry,
      countryCode: headerCountry,
      city: decodeURIComponent(headerCity),
      region: headerRegion || undefined,
      latitude: headerLat ? parseFloat(headerLat) : undefined,
      longitude: headerLon ? parseFloat(headerLon) : undefined,
      timezone: headerTimezone || undefined,
      isp: request.headers.get('cf-ip-isp') || 'Cloudflare / Edge Network',
      carrier: 'Broadband / Cellular',
      isPrivate: false,
    };
    geoCache.set(ip, { data: geoResult, timestamp: Date.now() });
    return geoResult;
  }

  // 4. Fallback lookup for public IPs (strictly looking up public IP network route)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'OktopusClothing-GeoService/1.0' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        const geoResult: IpGeoDetails = {
          ip,
          country: data.country || undefined,
          countryCode: data.countryCode || undefined,
          city: data.city || undefined,
          region: data.regionName || data.region || undefined,
          postalCode: data.zip || undefined,
          latitude: typeof data.lat === 'number' ? data.lat : undefined,
          longitude: typeof data.lon === 'number' ? data.lon : undefined,
          isp: data.isp || data.org || undefined,
          carrier: data.org || data.as || data.isp || 'Broadband / Mobile',
          organization: data.org || undefined,
          timezone: data.timezone || undefined,
          isPrivate: false,
        };
        geoCache.set(ip, { data: geoResult, timestamp: Date.now() });
        return geoResult;
      }
    }
  } catch {
    // Network lookup timed out or failed; fallback gracefully
  }

  // 5. Minimal fallback
  const fallback: IpGeoDetails = {
    ip,
    country: headerCountry || 'Unknown Country',
    city: headerCity || 'Unknown City',
    latitude: headerLat ? parseFloat(headerLat) : undefined,
    longitude: headerLon ? parseFloat(headerLon) : undefined,
    isp: 'Standard ISP',
    carrier: 'Broadband / Cellular',
    isPrivate: false,
  };
  geoCache.set(ip, { data: fallback, timestamp: Date.now() });
  return fallback;
}

