import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateImpliedProbability,
  evaluateValueBet,
  calculateParlayOdds,
  calculateROI,
  getConfidenceBadge,
} from './predictionMath.ts';

test('calculateImpliedProbability returns accurate percentages', () => {
  assert.equal(calculateImpliedProbability(2.0), 50);
  assert.equal(calculateImpliedProbability(1.5), 66.67);
  assert.equal(calculateImpliedProbability(4.0), 25);
  assert.equal(calculateImpliedProbability(1.0), 100);
});

test('evaluateValueBet correctly identifies positive EV and Kelly sizing', () => {
  // Odds 2.50 with 50% AI probability (Implied is 40%) -> positive edge of +25%
  const res = evaluateValueBet(2.5, 50, 1000, 0.25);
  assert.equal(res.isValue, true);
  assert.equal(res.edgePercentage, 25);
  assert.ok(res.recommendedKellyStake > 0);
  assert.ok(res.recommendedKellyStake <= 5.0); // Capped at safe 5% max
});

test('evaluateValueBet flags negative EV as non-value', () => {
  // Odds 1.80 with 45% AI probability (Implied is 55.56%) -> negative edge
  const res = evaluateValueBet(1.8, 45, 1000, 0.25);
  assert.equal(res.isValue, false);
  assert.ok(res.edgePercentage < 0);
  assert.equal(res.recommendedKellyStake, 0);
});

test('calculateParlayOdds computes combined multiplier', () => {
  const result = calculateParlayOdds([1.5, 2.0, 1.8]);
  // 1.5 * 2.0 * 1.8 = 5.4
  assert.equal(result.totalOdds, 5.4);
});

test('calculateROI calculates accurate returns', () => {
  assert.equal(calculateROI(250, 1000), 25);
  assert.equal(calculateROI(-100, 500), -20);
  assert.equal(calculateROI(0, 0), 0);
});

test('getConfidenceBadge assigns correct tier thresholds', () => {
  assert.equal(getConfidenceBadge(88).tier, 'elite');
  assert.equal(getConfidenceBadge(78).tier, 'high');
  assert.equal(getConfidenceBadge(65).tier, 'medium');
  assert.equal(getConfidenceBadge(45).tier, 'speculative');
});
