/**
 * Comprehensive Browser & Hardware Fingerprinting Service
 * Collects 20+ hardware, environment, network, and browser signals
 * Generates deterministic composite fingerprint hashes (100% private, self-hosted)
 */

export interface VisitorFingerprintData {
  // 1. Identification
  visitorId: string;
  fingerprintId: string;

  // 2. Network & Connection
  networkType: string; // '4g', 'wifi', 'ethernet', etc.
  downlink?: number; // Mb/s
  rtt?: number; // round-trip time in ms
  saveData?: boolean;

  // 3. Device & OS
  deviceOs: string; // 'macOS', 'Windows', 'iOS', 'Android', 'Linux', etc.
  osVersion?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  platform: string;

  // 4. Browser
  browserType: string; // 'Chrome', 'Safari', 'Firefox', 'Edge', etc.
  browserVersion: string;
  userAgent: string;

  // 5. Screen & Display
  screenWidth: number;
  screenHeight: number;
  screenAvailWidth: number;
  screenAvailHeight: number;
  colorDepth: number;
  pixelRatio: number;
  colorGamut?: string;
  prefersColorScheme?: 'dark' | 'light' | 'no-preference';

  // 6. Timezone & Locale
  timezone: string;
  timezoneOffset: number; // in minutes
  languages: string[];
  primaryLanguage: string;

  // 7. GPU & WebGL
  gpuRenderer: string;
  gpuVendor: string;
  webglVendor?: string;
  webglRenderer?: string;
  webglCanvasHash?: string;
  webglMaxTextureSize?: number;

  // 8. Audio
  audioHash?: string;

  // 9. Hardware & System
  hardwareConcurrency: number; // CPU Cores
  deviceMemory?: number; // RAM in GB (approximate)

  // 10. Sensors Support
  hasAccelerometer: boolean;
  hasGyroscope: boolean;
  hasOrientation: boolean;
  hasAmbientLight: boolean;

  // 11. Battery
  batteryLevel?: number; // percentage (0 - 100)
  batteryCharging?: boolean;

  // 12. Touch & Input
  touchPoints: number;
  hasTouch: boolean;

  // 13. Storage
  storageQuotaMB?: number;
  storageUsageMB?: number;
  hasLocalStorage: boolean;
  hasSessionStorage: boolean;
  hasIndexedDb: boolean;

  // 14. 2D Canvas & Fonts
  canvas2dHash?: string;
}

// Generate simple fast hex string from number
function toHex(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0');
}

// Fast string hash (Murmur3-inspired 32-bit hash)
function hashString(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (toHex(h1) + toHex(h2)).substring(0, 16);
}

// Cryptographic SHA-256 in browser
async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  return hashString(message) + hashString(message, 42);
}

// Local Storage Persistent Visitor ID
const VISITOR_STORAGE_KEY = '_okto_vid';

export function getOrCreatePersistentVisitorId(): string {
  if (typeof window === 'undefined') return 'server_placeholder';
  try {
    let vid = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!vid) {
      const randomPart = Math.random().toString(36).substring(2, 12);
      const timePart = Date.now().toString(36);
      vid = `okto_vid_${timePart}_${randomPart}`;
      localStorage.setItem(VISITOR_STORAGE_KEY, vid);
    }
    // Also store in cookie so server can read it if needed
    try {
      document.cookie = `${VISITOR_STORAGE_KEY}=${vid}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore
    }
    return vid;
  } catch {
    return `okto_temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

// OS Detection
function detectOS(ua: string, platform: string): { os: string; version?: string } {
  const lowerUA = ua.toLowerCase();
  const lowerPlat = platform.toLowerCase();

  if (/iphone|ipod/.test(lowerUA)) {
    const match = lowerUA.match(/os (\d+[_.]\d+)/);
    return { os: 'iOS', version: match ? match[1].replace(/_/g, '.') : undefined };
  }
  if (/ipad/.test(lowerUA) || (lowerPlat.includes('mac') && navigator.maxTouchPoints > 1)) {
    return { os: 'iPadOS', version: undefined };
  }
  if (/android/.test(lowerUA)) {
    const match = lowerUA.match(/android\s([0-9.]+)/);
    return { os: 'Android', version: match ? match[1] : undefined };
  }
  if (/macintosh|mac os x/.test(lowerUA) || lowerPlat.includes('mac')) {
    const match = lowerUA.match(/mac os x (\d+[_.]\d+)/);
    return { os: 'macOS', version: match ? match[1].replace(/_/g, '.') : undefined };
  }
  if (/windows nt/.test(lowerUA) || lowerPlat.includes('win')) {
    let ver = 'Windows';
    if (lowerUA.includes('windows nt 10.0')) ver = 'Windows 10/11';
    else if (lowerUA.includes('windows nt 6.3')) ver = 'Windows 8.1';
    else if (lowerUA.includes('windows nt 6.2')) ver = 'Windows 8';
    else if (lowerUA.includes('windows nt 6.1')) ver = 'Windows 7';
    return { os: ver };
  }
  if (/cros/.test(lowerUA)) return { os: 'Chrome OS' };
  if (/linux/.test(lowerUA) || lowerPlat.includes('linux')) return { os: 'Linux' };

  return { os: platform || 'Unknown OS' };
}

// Browser Detection
function detectBrowser(ua: string): { browser: string; version: string } {
  const lower = ua.toLowerCase();
  let browser = 'Unknown';
  let version = '0.0';

  if (/edg\/([0-9.]+)/.test(lower)) {
    const m = lower.match(/edg\/([0-9.]+)/);
    browser = 'Microsoft Edge';
    version = m ? m[1] : '0';
  } else if (/opr\/([0-9.]+)|opera\/([0-9.]+)/.test(lower)) {
    const m = lower.match(/(?:opr|opera)\/([0-9.]+)/);
    browser = 'Opera';
    version = m ? m[1] : '0';
  } else if (/chrome\/([0-9.]+)/.test(lower) && !lower.includes('chromium')) {
    const m = lower.match(/chrome\/([0-9.]+)/);
    browser = 'Google Chrome';
    version = m ? m[1] : '0';
  } else if (/samsungbrowser\/([0-9.]+)/.test(lower)) {
    const m = lower.match(/samsungbrowser\/([0-9.]+)/);
    browser = 'Samsung Internet';
    version = m ? m[1] : '0';
  } else if (/firefox\/([0-9.]+)/.test(lower)) {
    const m = lower.match(/firefox\/([0-9.]+)/);
    browser = 'Mozilla Firefox';
    version = m ? m[1] : '0';
  } else if (/safari\/([0-9.]+)/.test(lower) && !lower.includes('chrome')) {
    const m = lower.match(/version\/([0-9.]+)/);
    browser = 'Apple Safari';
    version = m ? m[1] : '0';
  }

  return { browser, version };
}

// Device Type
function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    ) ||
    window.innerWidth <= 768
  ) {
    return 'mobile';
  }
  return 'desktop';
}

// 2D Canvas Fingerprinting
function getCanvas2dFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unsupported';

    // Text with different fonts and styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('OKTOPUS 🐙 <clothing> 2026', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('OKTOPUS 🐙 <clothing> 2026', 4, 17);

    // Geometry & gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#f12711');
    grad.addColorStop(1, '#f5af19');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(50, 40, 15, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    return hashString(canvas.toDataURL());
  } catch {
    return 'error';
  }
}

// WebGL Fingerprint & GPU Information
function getWebGLInfo(): {
  renderer: string;
  vendor: string;
  canvasHash: string;
  maxTextureSize: number;
} {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      return {
        renderer: 'No WebGL',
        vendor: 'No WebGL',
        canvasHash: 'no_webgl',
        maxTextureSize: 0,
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let renderer = 'Generic WebGL';
    let vendor = 'Generic WebGL';

    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || renderer;
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || vendor;
    }

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;

    // Render simple scene to hash
    gl.clearColor(0.2, 0.4, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const canvasHash = hashString(canvas.toDataURL());

    return {
      renderer: String(renderer),
      vendor: String(vendor),
      canvasHash,
      maxTextureSize,
    };
  } catch {
    return {
      renderer: 'Error',
      vendor: 'Error',
      canvasHash: 'error',
      maxTextureSize: 0,
    };
  }
}

// Audio Context Fingerprinting (Silent)
async function getAudioFingerprint(): Promise<string> {
  try {
    const AudioContext =
      window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    if (!AudioContext) return 'unsupported';

    const context = new AudioContext(1, 44100, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const renderedBuffer = await context.startRendering();
    const samples = renderedBuffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < 5000; i++) {
      sum += Math.abs(samples[i] || 0);
    }
    return hashString(sum.toString());
  } catch {
    return 'audio_blocked';
  }
}

// Storage Quota Estimation
async function getStorageInfo(): Promise<{
  quotaMB?: number;
  usageMB?: number;
  hasLocal: boolean;
  hasSession: boolean;
  hasIdb: boolean;
}> {
  let hasLocal = false;
  let hasSession = false;
  let hasIdb = false;
  try {
    hasLocal = typeof localStorage !== 'undefined';
  } catch {}
  try {
    hasSession = typeof sessionStorage !== 'undefined';
  } catch {}
  try {
    hasIdb = typeof indexedDB !== 'undefined';
  } catch {}

  let quotaMB: number | undefined;
  let usageMB: number | undefined;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const est = await navigator.storage.estimate();
      if (est.quota) quotaMB = Math.round(est.quota / (1024 * 1024));
      if (est.usage) usageMB = Math.round(est.usage / (1024 * 1024));
    } catch {
      // ignore
    }
  }

  return { quotaMB, usageMB, hasLocal, hasSession, hasIdb };
}

// Battery Status
async function getBatteryInfo(): Promise<{ level?: number; charging?: boolean }> {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      const battery = await (navigator as any).getBattery();
      if (battery) {
        return {
          level: Math.round(battery.level * 100),
          charging: Boolean(battery.charging),
        };
      }
    }
  } catch {
    // Battery API restricted or rejected
  }
  return {};
}

// Color Gamut detection
function getColorGamut(): string {
  try {
    if (window.matchMedia('(color-gamut: rec2020)').matches) return 'rec2020';
    if (window.matchMedia('(color-gamut: p3)').matches) return 'p3';
    if (window.matchMedia('(color-gamut: srgb)').matches) return 'srgb';
  } catch {}
  return 'standard';
}

function getPrefersColorScheme(): 'dark' | 'light' | 'no-preference' {
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  } catch {}
  return 'no-preference';
}

/**
 * Main Fingerprint Harvester
 * Collects all 20 attributes and generates a composite deterministic fingerprintId
 */
export async function collectVisitorFingerprint(): Promise<VisitorFingerprintData> {
  if (typeof window === 'undefined') {
    throw new Error('collectVisitorFingerprint must be run on the client.');
  }

  const visitorId = getOrCreatePersistentVisitorId();
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || (navigator as any).userAgentData?.platform || '';

  // 1. OS & Browser
  const { os: deviceOs, version: osVersion } = detectOS(ua, platform);
  const { browser: browserType, version: browserVersion } = detectBrowser(ua);
  const deviceType = detectDeviceType();

  // 2. Network connection
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const networkType = conn?.effectiveType || conn?.type || 'unknown';
  const downlink = conn?.downlink ? Number(conn.downlink) : undefined;
  const rtt = conn?.rtt ? Number(conn.rtt) : undefined;
  const saveData = Boolean(conn?.saveData);

  // 3. Screen
  const screenWidth = window.screen.width || 0;
  const screenHeight = window.screen.height || 0;
  const screenAvailWidth = window.screen.availWidth || 0;
  const screenAvailHeight = window.screen.availHeight || 0;
  const colorDepth = window.screen.colorDepth || 24;
  const pixelRatio = Number((window.devicePixelRatio || 1).toFixed(2));
  const colorGamut = getColorGamut();
  const prefersColorScheme = getPrefersColorScheme();

  // 4. Timezone & Languages
  let timezone = 'UTC';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {}
  const timezoneOffset = new Date().getTimezoneOffset();
  const languages = Array.isArray(navigator.languages) ? [...navigator.languages] : [navigator.language || 'en'];
  const primaryLanguage = navigator.language || languages[0] || 'en';

  // 5. GPU & WebGL
  const webglInfo = getWebGLInfo();

  // 6. Audio
  const audioHash = await getAudioFingerprint();

  // 7. 2D Canvas
  const canvas2dHash = getCanvas2dFingerprint();

  // 8. Hardware & RAM
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = (navigator as any).deviceMemory ? Number((navigator as any).deviceMemory) : undefined;

  // 9. Sensors
  const hasAccelerometer = 'Accelerometer' in window;
  const hasGyroscope = 'Gyroscope' in window;
  const hasOrientation = 'AbsoluteOrientationSensor' in window;
  const hasAmbientLight = 'AmbientLightSensor' in window;

  // 10. Battery
  const battery = await getBatteryInfo();

  // 11. Touch
  const touchPoints = navigator.maxTouchPoints || 0;
  const hasTouch = touchPoints > 0 || 'ontouchstart' in window;

  // 12. Storage
  const storage = await getStorageInfo();

  // Deterministic Fingerprint Composite String
  // Combines high-stability traits (GPU, Screen, Audio, Canvas, CPU, RAM, OS, Timezone, Languages)
  const compositeTrait = [
    deviceOs,
    webglInfo.renderer,
    webglInfo.vendor,
    `${screenWidth}x${screenHeight}x${colorDepth}x${pixelRatio}`,
    audioHash,
    webglInfo.canvasHash,
    canvas2dHash,
    hardwareConcurrency,
    deviceMemory || 'na',
    timezone,
    languages.slice(0, 2).join(','),
    hasTouch ? `touch_${touchPoints}` : 'no_touch',
  ].join(':::');

  const fpHashRaw = await sha256(compositeTrait);
  const fingerprintId = `fp_${fpHashRaw.substring(0, 24)}`;

  return {
    visitorId,
    fingerprintId,
    networkType,
    downlink,
    rtt,
    saveData,
    deviceOs,
    osVersion,
    deviceType,
    platform,
    browserType,
    browserVersion,
    userAgent: ua,
    screenWidth,
    screenHeight,
    screenAvailWidth,
    screenAvailHeight,
    colorDepth,
    pixelRatio,
    colorGamut,
    prefersColorScheme,
    timezone,
    timezoneOffset,
    languages,
    primaryLanguage,
    gpuRenderer: webglInfo.renderer,
    gpuVendor: webglInfo.vendor,
    webglVendor: webglInfo.vendor,
    webglRenderer: webglInfo.renderer,
    webglCanvasHash: webglInfo.canvasHash,
    webglMaxTextureSize: webglInfo.maxTextureSize,
    audioHash,
    hardwareConcurrency,
    deviceMemory,
    hasAccelerometer,
    hasGyroscope,
    hasOrientation,
    hasAmbientLight,
    batteryLevel: battery.level,
    batteryCharging: battery.charging,
    touchPoints,
    hasTouch,
    storageQuotaMB: storage.quotaMB,
    storageUsageMB: storage.usageMB,
    hasLocalStorage: storage.hasLocal,
    hasSessionStorage: storage.hasSession,
    hasIndexedDb: storage.hasIdb,
    canvas2dHash,
  };
}
