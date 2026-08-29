/**
 * Campaign Metrics Safe Calculator
 * Task 28 — Step 2: Defensive Analytics Math
 */

export const safeNum = (val, fallback = 0) => {
  if (val === null || val === undefined) return fallback;
  const n = Number(val);
  return isNaN(n) || !isFinite(n) || n < 0 ? fallback : n;
};

export function calculateCTR(clicks, impressions, decimals = 2) {
  const c = safeNum(clicks);
  const i = safeNum(impressions);
  if (i === 0) return 0;
  const ctr = (c / i) * 100;
  return Number(ctr.toFixed(decimals));
}

export function calculateCPC(spend, clicks, decimals = 2) {
  const s = safeNum(spend);
  const c = safeNum(clicks);
  if (c === 0) return 0;
  const cpc = s / c;
  return Number(cpc.toFixed(decimals));
}

export function calculateCPA(spend, conversions, decimals = 2) {
  const s = safeNum(spend);
  const conv = safeNum(conversions);
  if (conv === 0) return 0;
  const cpa = s / conv;
  return Number(cpa.toFixed(decimals));
}

export function calculateROAS(revenue, spend, decimals = 2) {
  const rev = safeNum(revenue);
  const sp = safeNum(spend);
  if (sp === 0) return 0;
  const roas = rev / sp;
  return Number(roas.toFixed(decimals));
}

export function calculateConversionRate(conversions, clicks, decimals = 2) {
  const conv = safeNum(conversions);
  const clk = safeNum(clicks);
  if (clk === 0) return 0;
  const cvr = (conv / clk) * 100;
  return Number(cvr.toFixed(decimals));
}

export const metricsUtils = {
  calculateCTR,
  calculateCPC,
  calculateCPA,
  calculateROAS,
  calculateConversionRate,
};

export default metricsUtils;
