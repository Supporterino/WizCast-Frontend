import type { StoredGame } from '@/contexts/StoreProvider.tsx';

/** Mantine color names (you can add/remove as needed) */
const MANTINE_COLOR_NAMES = [
  'indigo',
  'blue',
  'violet',
  'pink',
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'teal',
  'cyan',
  'gray',
] as const;

/** Shades that Mantine exposes – 0 … 9 */
const MANTINE_SHADES = Array.from({ length: 10 }, (_, i) => i);

/** Pick a random element from an array */
const pickRandom = <T>(arr: ReadonlyArray<T>): T => arr[Math.floor(Math.random() * arr.length)];

/** Build a random Mantine color string (e.g. 'indigo.6') */
const getRandomMantineColor = (): string => `${pickRandom(MANTINE_COLOR_NAMES)}.${pickRandom(MANTINE_SHADES)}`;

/** Series item used by Mantine charts */
export interface SeriesItem {
  name: string;
  color: string; // Mantine colour string
}

/**
 * From a StoredGame (or just an array of player names) create a series
 * array suitable for Mantine chart components.
 *
 * @param gameOrPlayers – either a StoredGame or an array of names
 * @returns [{ name: 'Alice', color: 'indigo.6' }, ...]
 */
export function buildMantineSeries(gameOrPlayers: StoredGame | Array<string>): Array<SeriesItem> {
  const players = Array.isArray(gameOrPlayers) ? gameOrPlayers : gameOrPlayers.players;

  return players.map((name) => ({
    name,
    color: getRandomMantineColor(),
  }));
}
