import type { FunctionComponent } from 'react';
import { RoundSummary } from '@/components/RoundSummary/RoundSummary.tsx';

interface RoundSummaryOverlayProps {
  players: Array<string>;
  scoreChanges: Array<number>;
  roundIndex: number;
  onDismiss: () => void;
}

export const RoundSummaryOverlay: FunctionComponent<RoundSummaryOverlayProps> = ({
  players,
  scoreChanges,
  roundIndex,
  onDismiss,
}) => <RoundSummary players={players} scoreChanges={scoreChanges} roundIndex={roundIndex} onDismiss={onDismiss} />;
