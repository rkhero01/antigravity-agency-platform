/**
 * AI Priority & Impact Calculation Engine
 * Task 27 — Step 4: Deterministic Priority Scoring
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

/**
 * Safely parse numerical values from currency strings, percentages, or numbers
 */
function parseNumericValue(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return fallback;
    return val;
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num) || !isFinite(num)) return fallback;
    return num;
  }
  return fallback;
}

/**
 * Deterministic Priority Scoring
 * Inputs:
 * - revenueImpact: number or string (e.g. 380000 or "₹380,000")
 * - confidence: number or string (e.g. 95.4 or "95.4%")
 * - urgency: "Critical" | "High" | "Medium" | "Low"
 * - anomalySeverity: "Critical" | "Warning" | "Positive Spike" | "Low"
 * - leadValue: number or string
 * - conversionImpact: number or string
 * - clientImportance: number or string (e.g. MRR or tier weight)
 */
export function calculateAIPriority(inputs = {}) {
  const {
    revenueImpact = 0,
    confidence = 80,
    urgency = 'Medium',
    anomalySeverity = 'Low',
    leadValue = 0,
    conversionImpact = 0,
    clientImportance = 1,
  } = inputs || {};

  const numRevenue = Math.max(0, parseNumericValue(revenueImpact, 0));
  const numConfidence = Math.min(100, Math.max(0, parseNumericValue(confidence, 80)));
  const numLeadValue = Math.max(0, parseNumericValue(leadValue, 0));
  const numConvImpact = Math.max(0, parseNumericValue(conversionImpact, 0));

  // 1. Revenue Impact Component (0–35 pts)
  let revenueScore = 0;
  if (numRevenue >= 1000000) revenueScore = 35;
  else if (numRevenue >= 500000) revenueScore = 30;
  else if (numRevenue >= 250000) revenueScore = 24;
  else if (numRevenue >= 100000) revenueScore = 18;
  else if (numRevenue > 0) revenueScore = 10;

  // 2. Confidence Component (0–25 pts)
  const confidenceScore = Math.round((numConfidence / 100) * 25);

  // 3. Urgency Component (0–20 pts)
  let urgencyScore = 10;
  const lowerUrgency = String(urgency || '').toLowerCase();
  if (lowerUrgency.includes('critical') || lowerUrgency.includes('p0')) urgencyScore = 20;
  else if (lowerUrgency.includes('high') || lowerUrgency.includes('p1')) urgencyScore = 16;
  else if (lowerUrgency.includes('medium') || lowerUrgency.includes('p2')) urgencyScore = 10;
  else if (lowerUrgency.includes('low') || lowerUrgency.includes('p3')) urgencyScore = 5;

  // 4. Anomaly Severity Component (0–20 pts)
  let severityScore = 5;
  const lowerSeverity = String(anomalySeverity || '').toLowerCase();
  if (lowerSeverity.includes('critical')) severityScore = 20;
  else if (lowerSeverity.includes('warning') || lowerSeverity.includes('high')) severityScore = 14;
  else if (lowerSeverity.includes('positive') || lowerSeverity.includes('spike')) severityScore = 12;
  else if (lowerSeverity.includes('medium')) severityScore = 8;

  // Sum raw score and clamp to [0, 100]
  let rawScore = revenueScore + confidenceScore + urgencyScore + severityScore;
  if (isNaN(rawScore) || !isFinite(rawScore)) rawScore = 50;
  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Classify Priority Band
  let priority = 'P2';
  let urgencyLabel = 'Medium';
  let rationale = '';

  if (finalScore >= 85) {
    priority = 'P0';
    urgencyLabel = 'Critical';
    rationale = `Critical priority due to high revenue impact (₹${numRevenue.toLocaleString()}) and ${numConfidence}% confidence. Immediate intervention required.`;
  } else if (finalScore >= 65) {
    priority = 'P1';
    urgencyLabel = 'High';
    rationale = `High priority opportunity with strong statistical confidence (${numConfidence}%) and measurable conversion upside.`;
  } else if (finalScore >= 40) {
    priority = 'P2';
    urgencyLabel = 'Medium';
    rationale = `Moderate priority routine optimization with steady expected ROI and minimal operational friction.`;
  } else {
    priority = 'P3';
    urgencyLabel = 'Low';
    rationale = `Low urgency background enhancement. Can be scheduled in routine batch maintenance.`;
  }

  return {
    score: finalScore,
    priority,
    urgency: urgencyLabel,
    rationale,
    breakdown: {
      revenueScore,
      confidenceScore,
      urgencyScore,
      severityScore,
    },
  };
}

export const aiPriorityService = {
  calculateAIPriority,
};

export default aiPriorityService;
