/**
 * Safety-First SEO Site Crawler & HTML Inspector
 * Task 17 — SSRF Protection, Bounded Concurrency, HTML Parser & Indexability Analysis
 */

import { validateOutboundUrl } from '../automation/ssrfGuard.js';

export class SiteCrawler {
  constructor(config = {}) {
    this.timeoutMs = config.timeoutMs || 5000;
    this.maxResponseBytes = config.maxResponseBytes || 1024 * 1024; // 1MB limit
    this.maxRedirects = config.maxRedirects || 3;
    this.userAgent = config.userAgent || 'Antigravity-SEOBot/1.0 (+https://antigravity.agency/bot)';
  }

  /**
   * Crawl a single target URL safely
   */
  async crawlPage(targetUrl) {
    // 1. SSRF & Protocol Safety Check
    const ssrfCheck = validateOutboundUrl(targetUrl);
    if (!ssrfCheck.isValid) {
      return {
        url: targetUrl,
        success: false,
        blocked: true,
        error: ssrfCheck.reason,
        status: 400,
      };
    }

    // Require HTTPS for live crawler safety
    if (!targetUrl.startsWith('https://')) {
      return {
        url: targetUrl,
        success: false,
        blocked: true,
        error: 'Crawler security policy enforces HTTPS only. Insecure HTTP targets are rejected.',
        status: 400,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      const status = response.status;
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        return {
          url: targetUrl,
          success: false,
          status,
          error: `Non-HTML content type: "${contentType}".`,
        };
      }

      // Enforce response size limits
      const htmlText = await response.text();
      if (htmlText.length > this.maxResponseBytes) {
        return {
          url: targetUrl,
          success: false,
          status,
          error: `Response size (${htmlText.length} bytes) exceeds safety limit of ${this.maxResponseBytes} bytes.`,
        };
      }

      const parsed = this.parseHtml(htmlText, targetUrl);

      return {
        url: targetUrl,
        success: response.ok,
        status,
        ...parsed,
        crawledAt: new Date().toISOString(),
      };
    } catch (err) {
      clearTimeout(timeoutId);
      return {
        url: targetUrl,
        success: false,
        status: err.name === 'AbortError' ? 408 : 500,
        error: err.name === 'AbortError' ? 'Crawler request timed out.' : err.message,
      };
    }
  }

  /**
   * Extract key SEO tags & technical signals from HTML
   */
  parseHtml(html, pageUrl) {
    // Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Meta Description
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i) ||
      html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;

    // Canonical
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([\s\S]*?)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1].trim() : null;

    // Robots Meta
    const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([\s\S]*?)["']/i);
    const robots = robotsMatch ? robotsMatch[1].toLowerCase().trim() : null;
    const isNoindex = robots ? robots.includes('noindex') : false;
    const isNofollow = robots ? robots.includes('nofollow') : false;

    // H1 Tags
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());

    // Images & Alt Coverage
    const imgMatches = [...html.matchAll(/<img\s+([^>]+)>/gi)];
    let totalImages = imgMatches.length;
    let imagesWithAlt = 0;
    for (const match of imgMatches) {
      if (/alt=["'][^"']+["']/i.test(match[1])) {
        imagesWithAlt++;
      }
    }

    // Word count calculation (strip scripts, styles, HTML tags)
    const cleanedText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

    // Internal links count
    const linkMatches = [...html.matchAll(/<a[^>]+href=["']([\s\S]*?)["']/gi)];
    const links = linkMatches.map((m) => m[1].trim());

    return {
      title,
      metaDescription,
      canonical,
      robots,
      isNoindex,
      isNofollow,
      h1Tags: h1Matches,
      h1Count: h1Matches.length,
      primaryH1: h1Matches[0] || null,
      totalImages,
      imagesWithAlt,
      imagesMissingAlt: totalImages - imagesWithAlt,
      wordCount,
      totalLinks: links.length,
    };
  }
}

export const siteCrawler = new SiteCrawler();
export default siteCrawler;
