import type { StoredGame } from '@/contexts/StoreProvider.tsx';

export interface RoundDiff {
  round: number;
  diff: number | undefined;
}

export type CumulativeScoreEntry = {
  round: number;
} & Record<string, number>;

/**
 * Calculates the **signed** difference between predictions and actuals
 * for every round in a StoredGame.
 *
 * @param game – the stored game data
 * @returns an array of { round, diff } objects
 */
export function calculateRoundDiffs(game: StoredGame): Array<RoundDiff> {
  return game.rounds.map((round) => {
    const roundDiff = round.predictions.reduce((sum, pred, idx) => {
      const actual = round.actuals[idx];

      // Skip if either value is undefined (e.g. not yet played)
      if (pred === undefined || actual === undefined) return sum;

      // Signed difference: prediction minus actual
      const diff = pred - actual;
      return sum! + diff;
    }, 0);

    return { round: round.id + 1, diff: roundDiff };
  });
}

/**
 * Builds a cumulative‑score table for every round.
 *
 * @param game – the stored game data
 * @returns an array of objects, each containing:
 *          - round: the round id
 *          - one numeric field per player (keyed by their name)
 *
 * Example output:
 * [
 *   { round: 1, Alice: 5, Bob: -2 },
 *   { round: 2, Alice: 8, Bob: 0 }
 * ]
 */
export function buildCumulativeScores(game: StoredGame): Array<CumulativeScoreEntry> {
  // Initialise a running total map – key = player index
  const runningTotals: Array<number> = new Array(game.players.length).fill(0);

  // Result array
  const table: Array<CumulativeScoreEntry> = [];

  for (const round of game.rounds) {
    // Apply this round's score changes to the running totals
    round.scoreChanges.forEach((change, idx) => {
      // Treat undefined changes as 0
      const delta = change ?? 0;
      runningTotals[idx] += delta;
    });

    // Build the object for this round
    const entry: CumulativeScoreEntry = { round: round.id + 1 };

    // Map each player name to its current total
    game.players.forEach((name, idx) => {
      entry[name] = runningTotals[idx];
    });

    table.push(entry);
  }

  return table;
}
