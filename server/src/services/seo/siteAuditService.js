/**
 * SEO Site Audit & Technical Health Engine
 * Task 17 — Technical SEO Issue Diagnosis, Severity Scoring & Action Item Synthesis
 */

import { siteCrawler } from './siteCrawler.js';
import { seoTaskRepository } from '../../repositories/seoTaskRepository.js';
import { clientRepository } from '../../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../auditService.js';
import { AuthorizationError, NotFoundError } from '../../utils/errors.js';

export const AUDIT_SEVERITY = {
  INFO: 'INFO',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export class SiteAuditService {
  /**
   * Run a comprehensive technical SEO site audit on target URL
   */
  async runAudit(url, agencyId, options = {}) {
    const { clientId, actorId = 'SYSTEM', autoCreateTasks = false, requestId = `REQ-${Date.now()}` } = options;

    if (clientId) {
      const client = await clientRepository.findById(clientId, agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
    }

    const crawlResult = await siteCrawler.crawlPage(url);

    if (crawlResult.blocked) {
      return {
        url,
        success: false,
        status: 'BLOCKED',
        error: crawlResult.error,
        healthScore: 0,
        findings: [
          {
            type: 'SECURITY_BLOCKED',
            severity: AUDIT_SEVERITY.CRITICAL,
            url,
            title: 'SSRF / Security Gate Blocked',
            description: crawlResult.error,
            recommendation: 'Ensure the audited URL points to a public HTTPS production domain.',
          },
        ],
      };
    }

    if (!crawlResult.success) {
      return {
        url,
        success: false,
        status: 'FAILED',
        error: crawlResult.error || `HTTP ${crawlResult.status}`,
        healthScore: 0,
        findings: [
          {
            type: 'HTTP_ERROR',
            severity: AUDIT_SEVERITY.CRITICAL,
            url,
            title: `HTTP ${crawlResult.status} Crawl Failure`,
            description: crawlResult.error || 'Server responded with a non-200 HTTP status code.',
            recommendation: 'Check web server configuration, DNS settings, and SSL certificate validity.',
          },
        ],
      };
    }

    const findings = this.evaluateFindings(crawlResult);
    const healthScore = this.calculateHealthScore(findings);

    // Persist audit run in AuditLog
    const auditRecord = await auditService.log({
      actorId,
      agencyId,
      clientId: clientId || null,
      action: AUDIT_ACTIONS.EXECUTE,
      entityType: 'SEO_SITE_AUDIT',
      entityId: `audit-${Date.now()}`,
      before: null,
      after: {
        url,
        healthScore,
        findingsCount: findings.length,
        criticalCount: findings.filter((f) => f.severity === AUDIT_SEVERITY.CRITICAL).length,
        highCount: findings.filter((f) => f.severity === AUDIT_SEVERITY.HIGH).length,
        mediumCount: findings.filter((f) => f.severity === AUDIT_SEVERITY.MEDIUM).length,
        crawledAt: crawlResult.crawledAt,
      },
      requestId,
    });

    // Optionally auto-create optimization tasks in PostgreSQL
    if (autoCreateTasks && clientId) {
      const urgentFindings = findings.filter(
        (f) => f.severity === AUDIT_SEVERITY.CRITICAL || f.severity === AUDIT_SEVERITY.HIGH
      );
      for (const finding of urgentFindings.slice(0, 3)) {
        await seoTaskRepository.create({
          agencyId,
          clientId,
          title: `Fix: ${finding.title}`,
          description: `${finding.description} — Recommendation: ${finding.recommendation}`,
          priority: finding.severity === AUDIT_SEVERITY.CRITICAL ? 'CRITICAL' : 'HIGH',
          status: 'TODO',
          completion: 0,
          notes: `Auto-generated from SEO Site Audit for ${url}`,
        });
      }
    }

    return {
      id: auditRecord?.id || `audit-${Date.now()}`,
      url,
      success: true,
      healthScore,
      crawledData: {
        title: crawlResult.title,
        metaDescription: crawlResult.metaDescription,
        canonical: crawlResult.canonical,
        primaryH1: crawlResult.primaryH1,
        h1Count: crawlResult.h1Count,
        wordCount: crawlResult.wordCount,
        totalImages: crawlResult.totalImages,
        imagesMissingAlt: crawlResult.imagesMissingAlt,
        isNoindex: crawlResult.isNoindex,
      },
      findings,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Evaluate crawl output against standard technical SEO heuristics
   */
  evaluateFindings(crawl) {
    const findings = [];

    // Title checks
    if (!crawl.title) {
      findings.push({
        type: 'MISSING_TITLE',
        severity: AUDIT_SEVERITY.CRITICAL,
        url: crawl.url,
        title: 'Missing Page Title Tag',
        description: 'The page has no <title> tag in the HTML head.',
        recommendation: 'Add a concise, keyword-rich title between 50 and 60 characters.',
      });
    } else if (crawl.title.length < 30 || crawl.title.length > 70) {
      findings.push({
        type: 'SUBOPTIMAL_TITLE_LENGTH',
        severity: AUDIT_SEVERITY.LOW,
        url: crawl.url,
        title: `Suboptimal Title Length (${crawl.title.length} chars)`,
        description: `Title length is ${crawl.title.length} characters (recommended: 45–65 characters).`,
        recommendation: 'Adjust page title length to fit standard search engine result snippet widths.',
      });
    }

    // Meta description checks
    if (!crawl.metaDescription) {
      findings.push({
        type: 'MISSING_META_DESCRIPTION',
        severity: AUDIT_SEVERITY.HIGH,
        url: crawl.url,
        title: 'Missing Meta Description',
        description: 'No meta description found in HTML head.',
        recommendation: 'Add a compelling meta description between 120 and 160 characters summarizing the page value proposition.',
      });
    }

    // H1 Heading checks
    if (crawl.h1Count === 0) {
      findings.push({
        type: 'MISSING_H1',
        severity: AUDIT_SEVERITY.HIGH,
        url: crawl.url,
        title: 'Missing H1 Heading Tag',
        description: 'Page lacks a top-level <h1> heading tag.',
        recommendation: 'Include exactly one primary <h1> tag reflecting the main page topic.',
      });
    } else if (crawl.h1Count > 1) {
      findings.push({
        type: 'MULTIPLE_H1',
        severity: AUDIT_SEVERITY.MEDIUM,
        url: crawl.url,
        title: `Multiple H1 Heading Tags (${crawl.h1Count} found)`,
        description: 'Page defines multiple <h1> tags, which dilutes heading hierarchy.',
        recommendation: 'Consolidate headings so that only one primary <h1> tag is present, using <h2>/<h3> for sub-sections.',
      });
    }

    // Canonical link checks
    if (!crawl.canonical) {
      findings.push({
        type: 'MISSING_CANONICAL',
        severity: AUDIT_SEVERITY.MEDIUM,
        url: crawl.url,
        title: 'Missing Canonical Tag',
        description: 'No <link rel="canonical"> tag found.',
        recommendation: 'Add self-referencing canonical URL tag to prevent duplicate content indexing.',
      });
    }

    // Robots noindex
    if (crawl.isNoindex) {
      findings.push({
        type: 'NOINDEX_DETECTED',
        severity: AUDIT_SEVERITY.CRITICAL,
        url: crawl.url,
        title: 'Robots "noindex" Directive Present',
        description: 'Meta robots tag specifies "noindex", preventing search engines from indexing this page.',
        recommendation: 'Remove noindex directive if this page is meant for organic search visibility.',
      });
    }

    // Image Alt tags
    if (crawl.imagesMissingAlt > 0) {
      findings.push({
        type: 'MISSING_IMAGE_ALT',
        severity: AUDIT_SEVERITY.LOW,
        url: crawl.url,
        title: `${crawl.imagesMissingAlt} Image(s) Missing Alt Text`,
        description: `${crawl.imagesMissingAlt} out of ${crawl.totalImages} images do not have descriptive alt attributes.`,
        recommendation: 'Provide descriptive alt attributes for all content images for accessibility and image search ranking.',
      });
    }

    // Thin content
    if (crawl.wordCount < 300) {
      findings.push({
        type: 'THIN_CONTENT',
        severity: AUDIT_SEVERITY.MEDIUM,
        url: crawl.url,
        title: `Thin Content Detected (${crawl.wordCount} words)`,
        description: `Page text contains only ${crawl.wordCount} words, below the recommended minimum of 300 words.`,
        recommendation: 'Expand page content with comprehensive explanations, FAQs, and topic depth.',
      });
    }

    return findings;
  }

  /**
   * Calculate overall health score (0-100) based on severity deductions
   */
  calculateHealthScore(findings) {
    let score = 100;
    for (const f of findings) {
      if (f.severity === AUDIT_SEVERITY.CRITICAL) score -= 25;
      else if (f.severity === AUDIT_SEVERITY.HIGH) score -= 15;
      else if (f.severity === AUDIT_SEVERITY.MEDIUM) score -= 8;
      else if (f.severity === AUDIT_SEVERITY.LOW) score -= 3;
    }
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Retrieve historical site audits for an agency
   */
  async getAuditHistory(agencyId) {
    const audits = await auditService.getAuditLogs({
      entityType: 'SEO_SITE_AUDIT',
    }, agencyId);

    return audits.map((a) => {
      const data = a.after || {};
      return {
        id: a.id,
        agencyId: a.agencyId,
        clientId: a.clientId,
        url: data.url,
        healthScore: data.healthScore,
        findingsCount: data.findingsCount,
        criticalCount: data.criticalCount,
        timestamp: a.createdAt,
      };
    });
  }
}

export const siteAuditService = new SiteAuditService();
export default siteAuditService;
