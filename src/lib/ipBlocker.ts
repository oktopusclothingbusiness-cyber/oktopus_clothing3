/**
 * High-Performance IP Blocker & Bot Attack Protection Engine (TypeScript Wrapper)
 * Imports the shared state from lib/ipBlocker.js to ensure identical state across runtime environments.
 */

import {
  isWhitelisted as _isWhitelisted,
  isIpBlocked as _isIpBlocked,
  blockIp as _blockIp,
  unblockIp as _unblockIp,
  recordViolation as _recordViolation,
  isSuspiciousBotPath as _isSuspiciousBotPath,
  getBlockedIps as _getBlockedIps,
} from '../../lib/ipBlocker.js';

export interface BlockedIpEntry {
  ip: string;
  reason: string;
  bannedAt: number;
  expiresAt: number | null;
}

export function isWhitelisted(ip: string): boolean {
  return _isWhitelisted(ip);
}

export function isIpBlocked(ip: string): { blocked: boolean; reason?: string; expiresAt?: number | null } {
  return _isIpBlocked(ip);
}

export function blockIp(
  ip: string,
  durationSeconds?: number | null,
  reason?: string
): void {
  _blockIp(ip, durationSeconds ?? undefined, reason);
}

export function unblockIp(ip: string): boolean {
  return _unblockIp(ip);
}

export function recordViolation(
  ip: string,
  reason?: string
): { banned: boolean; banExpiresAt?: number | null; count: number } {
  return _recordViolation(ip, reason);
}

export function isSuspiciousBotPath(pathname: string): boolean {
  return _isSuspiciousBotPath(pathname);
}

export function getBlockedIps(): BlockedIpEntry[] {
  return _getBlockedIps();
}
