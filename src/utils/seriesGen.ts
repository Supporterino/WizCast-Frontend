import type { StoredGame } from '@/contexts/StoreProvider.tsx';

/** Mantine color names (you can add/remove as needed) */
const MANTINE_COLOR_NAMES = ['indigo', 'blue', 'violet', 'pink', 'red', 'orange', 'yellow', 'lime', 'green', 'cyan', 'gray'] as const;

/** Shades that Mantine exposes – 0 … 9 */
const MANTINE_SHADES = Array.from({ length: 10 }, (_, i) => i);

/** Pick a random element from an array */
const pickRandom = <T>(arr: ReadonlyArray<T>): T => arr[Math.floor(Math.random() * arr.length)];

/** Series item used by Mantine charts */
export interface SeriesItem {
  name: string;
  color: string; // Mantine colour string
}

/**
 * From a StoredGame (or just an array of player names) create a series
 * array suitable for Mantine chart components.
 *
 * Each series receives a **unique base color** (no duplicates).
 * The shade is still random.
 *
 * @param gameOrPlayers – either a StoredGame or an array of names
 * @returns [{ name: 'Alice', color: 'indigo.6' }, ...]
 */
export function buildMantineSeries(gameOrPlayers: StoredGame | Array<string>): Array<SeriesItem> {
  const players = Array.isArray(gameOrPlayers) ? gameOrPlayers : gameOrPlayers.players;

  // Copy of the base colors so we can remove used ones
  const availableColors = [...MANTINE_COLOR_NAMES];

  return players.map((name) => {
    if (availableColors.length === 0) {
      throw new Error(`Not enough unique Mantine base colors for ${players.length} players.`);
    }

    // Pick a unique base color and remove it from the pool
    const base = pickRandom(availableColors);
    const idx = availableColors.indexOf(base);
    if (idx > -1) {
      availableColors.splice(idx, 1);
    }

    // Random shade
    const shade = pickRandom(MANTINE_SHADES);

    return { name, color: `${base}.${shade}` };
  });
}
