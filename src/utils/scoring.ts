import type { RoundData, Rule } from '@/types/game.ts';

export interface ValidationResult {
  valid: boolean;
  errorCode?: string;
  message?: string;
}

export function computeScoreChanges(predictions: Array<number | undefined>, actuals: Array<number | undefined>): Array<number> {
  return predictions.map((pred, i) => {
    const actual = actuals[i];
    if (pred === undefined || actual === undefined) return 0;
    if (pred === actual) return 20 + 10 * actual;
    return Math.abs(pred - actual) * -10;
  });
}

export function computeSingleScoreChange(prediction: number, actual: number): number {
  if (prediction === actual) return 20 + 10 * actual;
  return Math.abs(prediction - actual) * -10;
}

export function accumulateScores(rounds: Array<RoundData>, playerCount: number): Array<number> {
  return rounds.reduce((acc, r) => {
    r.scoreChanges.forEach((sc, i) => {
      if (sc !== undefined) acc[i] += sc;
    });
    return acc;
  }, Array(playerCount).fill(0));
}

export function validateRoundSubmission(
  roundIdx: number,
  predictions: Array<number | undefined>,
  actuals: Array<number | undefined>,
  rules: Array<Rule>,
): ValidationResult {
  if (!predictions.every((v) => v !== undefined)) {
    return { valid: false, errorCode: 'INCOMPLETE_PREDICTIONS', message: 'All predictions must be filled' };
  }
  if (!actuals.every((v) => v !== undefined)) {
    return { valid: false, errorCode: 'INCOMPLETE_ACTUALS', message: 'All actuals must be filled' };
  }
  const preds = predictions;
  const acts = actuals;
  if (!preds.every((v) => v <= roundIdx + 1)) {
    return { valid: false, errorCode: 'TOO_MANY_PREDICTIONS', message: 'No prediction may exceed the round number + 1' };
  }
  const predSum = preds.reduce((acc, val) => acc + val, 0);
  if (rules.length > 0 && rules[0].active && predSum === roundIdx + 1) {
    return { valid: false, errorCode: 'NO_MATCHING_PREDICTION', message: 'Sum of predictions must not equal the round number + 1' };
  }
  const actualSum = acts.reduce((acc, val) => acc + val, 0);
  if (actualSum !== roundIdx + 1) {
    return { valid: false, errorCode: 'INVALID_ACTUALS_TOTAL', message: 'Sum of actuals must equal the round number + 1' };
  }
  return { valid: true };
}

export function getScoreTillRound(rounds: Array<RoundData>, end: number, playerCount: number): Array<number> {
  return accumulateScores(rounds.slice(0, end), playerCount);
}
