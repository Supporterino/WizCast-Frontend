import type { RoundData } from '@/types/game.ts';

export function sumFiniteNumbers(values: Array<number | undefined>): number {
  return values.reduce<number>((acc, value) => (typeof value === 'number' && Number.isFinite(value) ? acc + value : acc), 0);
}

export function sumRoundTotal(round: RoundData | undefined, field: 'predictions' | 'actuals'): number {
  if (!round) return 0;
  return sumFiniteNumbers(round[field]);
}
