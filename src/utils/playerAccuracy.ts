import type { StoredGame } from '@/contexts/StoreProvider.tsx';

export type PlayerAccuracy = Record<string, number | string>;

/**
 * Computes how accurately each player hit their predictions and
 * returns an object that also contains a constant `idx` field.
 *
 * @param game – the stored game data
 * @returns an object: { idx: "game", [playerName]: accuracy }
 */
export function calculatePlayerAccuracy(game: StoredGame): PlayerAccuracy {
  const playerCount = game.players.length;

  // Counters for each player (index matches `players` array)
  const hits = new Array(playerCount).fill(0);
  const totals = new Array(playerCount).fill(0);

  // Walk every round
  for (const round of game.rounds) {
    round.predictions.forEach((pred, idx) => {
      const actual = round.actuals[idx];

      // Skip if either value is missing
      if (pred === undefined || actual === undefined) return;

      totals[idx] += 1;
      if (pred === actual) hits[idx] += 1;
    });
  }

  // Build the result object
  const accuracy: Record<string, number | string> = { idx: 'game' };

  game.players.forEach((name, idx) => {
    const total = totals[idx];
    const hitRate = total === 0 ? 0 : (hits[idx] / total) * 100;

    // Round to two decimals for readability
    accuracy[name] = Math.round(hitRate * 100) / 100;
  });

  return accuracy;
}
