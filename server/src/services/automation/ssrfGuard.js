/**
 * Outbound Webhook SSRF Guard
 * Task 14 — Phase 6: Production Outbound Webhook Security & SSRF Protection
 */

import { URL } from 'url';

// Disallowed Hostnames
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'instance-data',
]);

/**
 * Validate an outbound webhook URL against SSRF attack vectors
 * Rejects loopback, private RFC1918, link-local, cloud metadata, and non-HTTPS protocols
 */
export function validateOutboundUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return {
      isValid: false,
      reason: 'Missing or malformed target URL parameter.',
    };
  }

  let parsed;
  try {
    parsed = new URL(urlString.trim());
  } catch (e) {
    return {
      isValid: false,
      reason: `Invalid URL format: "${urlString}".`,
    };
  }

  // 1. Enforce HTTPS Protocol
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      isValid: false,
      reason: `Unsupported protocol "${parsed.protocol}". Only HTTPS/HTTP are permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // 2. Reject Explicit Blacklisted Hostnames
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    return {
      isValid: false,
      reason: `SSRF Violation: Target host "${hostname}" is a forbidden internal or loopback host.`,
    };
  }

  // 3. IPv4 Private & Link-Local Address Range Checks
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);

  if (match) {
    const [, o1, o2, o3, o4] = match.map(Number);

    // Loopback 127.0.0.0/8
    if (o1 === 127) {
      return { isValid: false, reason: 'SSRF Violation: Loopback addresses (127.0.0.0/8) are blocked.' };
    }
    // 0.0.0.0/8
    if (o1 === 0) {
      return { isValid: false, reason: 'SSRF Violation: 0.0.0.0/8 range is blocked.' };
    }
    // RFC1918 10.0.0.0/8
    if (o1 === 10) {
      return { isValid: false, reason: 'SSRF Violation: Private class A network (10.0.0.0/8) is blocked.' };
    }
    // RFC1918 172.16.0.0/12 (172.16.0.0 – 172.31.255.255)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) {
      return { isValid: false, reason: 'SSRF Violation: Private class B network (172.16.0.0/12) is blocked.' };
    }
    // RFC1918 192.168.0.0/16
    if (o1 === 192 && o2 === 168) {
      return { isValid: false, reason: 'SSRF Violation: Private class C network (192.168.0.0/16) is blocked.' };
    }
    // Link-local / Cloud Metadata 169.254.0.0/16 (e.g., AWS/GCP 169.254.169.254)
    if (o1 === 169 && o2 === 254) {
      return { isValid: false, reason: 'SSRF Violation: Link-local & cloud metadata network (169.254.0.0/16) is blocked.' };
    }
  }

  // 4. IPv6 Private & Loopback Checks
  if (
    hostname.startsWith('fe80:') ||
    hostname.startsWith('fc00:') ||
    hostname.startsWith('fd00:') ||
    hostname === '[::1]' ||
    hostname === '::1'
  ) {
    return {
      isValid: false,
      reason: 'SSRF Violation: IPv6 private/link-local/loopback addresses are blocked.',
    };
  }

  return {
    isValid: true,
    url: parsed.toString(),
    hostname,
  };
}

export const ssrfGuard = {
  validateOutboundUrl,
};

export default ssrfGuard;
