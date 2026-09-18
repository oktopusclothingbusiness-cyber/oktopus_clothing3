/**
 * High-Performance IP Blocker & Bot Attack Protection Engine (ESM)
 * Shared between Next.js and Express servers.
 */

// In-memory registry for blocked IPs: IP -> { reason, bannedAt, expiresAt }
const blockedIps = new Map();

// In-memory tracker for rate limit / security violations per IP
const ipViolations = new Map();

// Configuration constants
const VIOLATION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_VIOLATIONS_BEFORE_BAN = 3;
const DEFAULT_BAN_DURATION_SECONDS = 60 * 60; // 1 hour

// Suspicious URL patterns scanned by malicious bots and web vulnerability tools
const MALICIOUS_BOT_PATHS = [
  '/.env',
  '/.git',
  '/wp-admin',
  '/wp-login.php',
  '/phpmyadmin',
  '/admin.php',
  '/xmlrpc.php',
  '/.aws',
  '/id_rsa',
  '/.ssh',
  '/eval-stdin.php',
  '/telescope/requests',
  '/actuator/health',
  '/solr/',
];

/**
 * Checks if an IP is whitelisted (localhost or explicitly whitelisted via env).
 */
export function isWhitelisted(ip) {
  if (!ip) return false;
  const cleanIp = ip.trim();

  if (['127.0.0.1', '::1', 'localhost', '0.0.0.0'].includes(cleanIp)) {
    return true;
  }

  const envWhitelist = process.env.WHITELISTED_IPS;
  if (envWhitelist) {
    const list = envWhitelist.split(',').map((item) => item.trim());
    if (list.includes(cleanIp)) return true;
  }

  return false;
}

/**
 * Checks whether an IP is currently blocked. Automatically clears expired bans.
 */
export function isIpBlocked(ip) {
  if (!ip || isWhitelisted(ip)) {
    return { blocked: false };
  }

  const cleanIp = ip.trim();
  const entry = blockedIps.get(cleanIp);

  if (!entry) {
    return { blocked: false };
  }

  // Check if temporary ban has expired
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    blockedIps.delete(cleanIp);
    return { blocked: false };
  }

  return {
    blocked: true,
    reason: entry.reason,
    expiresAt: entry.expiresAt,
  };
}

/**
 * Blocks an IP address either temporarily or permanently.
 */
export function blockIp(
  ip,
  durationSeconds = DEFAULT_BAN_DURATION_SECONDS,
  reason = 'Automated security lockout'
) {
  if (!ip || isWhitelisted(ip)) return;

  const cleanIp = ip.trim();
  const now = Date.now();
  const expiresAt = durationSeconds && durationSeconds > 0 ? now + durationSeconds * 1000 : null;

  blockedIps.set(cleanIp, {
    reason,
    bannedAt: now,
    expiresAt,
  });

  ipViolations.delete(cleanIp);
}

/**
 * Unblocks an IP address.
 */
export function unblockIp(ip) {
  if (!ip) return false;
  return blockedIps.delete(ip.trim());
}

/**
 * Records a security or rate-limit violation. Automatically bans IP once threshold is reached.
 */
export function recordViolation(ip, reason = 'Security rate limit exceeded') {
  if (!ip || isWhitelisted(ip)) {
    return { banned: false, count: 0 };
  }

  const cleanIp = ip.trim();
  const now = Date.now();
  let record = ipViolations.get(cleanIp);

  if (!record || now - record.firstViolation > VIOLATION_WINDOW_MS) {
    record = { count: 1, firstViolation: now };
  } else {
    record.count += 1;
  }

  ipViolations.set(cleanIp, record);

  if (record.count >= MAX_VIOLATIONS_BEFORE_BAN) {
    blockIp(cleanIp, DEFAULT_BAN_DURATION_SECONDS, `Automated ban: ${reason} (${record.count} violations)`);
    return {
      banned: true,
      banExpiresAt: Date.now() + DEFAULT_BAN_DURATION_SECONDS * 1000,
      count: record.count,
    };
  }

  return { banned: false, count: record.count };
}

/**
 * Checks if a requested URL pathname matches known automated bot scanning signatures.
 */
export function isSuspiciousBotPath(pathname) {
  if (!pathname) return false;
  const lower = pathname.toLowerCase();
  return MALICIOUS_BOT_PATHS.some((path) => lower.includes(path));
}

/**
 * Returns all active blocked IPs.
 */
export function getBlockedIps() {
  const now = Date.now();
  const list = [];

  for (const [ip, entry] of blockedIps.entries()) {
    if (entry.expiresAt && now > entry.expiresAt) {
      blockedIps.delete(ip);
    } else {
      list.push({
        ip,
        reason: entry.reason,
        bannedAt: entry.bannedAt,
        expiresAt: entry.expiresAt,
      });
    }
  }

  return list;
}
