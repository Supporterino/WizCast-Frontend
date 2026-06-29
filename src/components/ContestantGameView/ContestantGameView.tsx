import { Table, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import type { RoundData } from '@/types/game.ts';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { getScoreTillRound } from '@/utils/scoring.ts';

interface ContestantGameViewProps {
  players: Array<string>;
  rounds: Array<RoundData>;
  scores: Array<number>;
  currentRound: number;
}

const placeholder = '—';

export const ContestantGameView: FunctionComponent<ContestantGameViewProps> = ({ players, rounds, scores, currentRound }) => {
  const { height } = useViewportSize();
  const { t } = useTranslation();

  return (
    <Table.ScrollContainer minWidth={200 * players.length} maxHeight={height - 100}>
      <Table stickyHeader withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th></Table.Th>
            {players.map((player, i) => (
              <Table.Th key={i}>
                <FlexRow>{player}</FlexRow>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>
              <FlexRow>{t('finalRow')}</FlexRow>
            </Table.Td>
            {players.map((_, index) => (
              <Table.Td key={index}>
                <FlexRow>
                  <Text>{scores[index]}</Text>
                </FlexRow>
              </Table.Td>
            ))}
          </Table.Tr>
          {rounds.map((round, idx) => {
            const roundScores = getScoreTillRound(rounds, idx + 1, players.length);
            const isActiveRound = idx === currentRound;
            return (
              <Table.Tr
                key={`round-${idx}`}
                bg={isActiveRound ? 'var(--mantine-color-blue-light)' : undefined}
                style={isActiveRound ? { fontWeight: 'bold' } : undefined}
              >
                <Table.Td>
                  <FlexRow>{idx + 1}</FlexRow>
                </Table.Td>
                {players.map((_, index) => {
                  const pred = round.predictions[index];
                  const act = round.actuals[index];
                  return (
                    <Table.Td key={index}>
                      <FlexRow fullWidth>
                        <Text size={isActiveRound ? 'sm' : 'xs'} fw={isActiveRound ? 700 : undefined}>
                          {pred !== undefined ? pred : placeholder} → {act !== undefined ? act : placeholder}
                        </Text>
                        <Text size="xs" c="dimmed" ml={4}>
                          {roundScores[index]} ({round.scoreChanges[index] ?? 0})
                        </Text>
                      </FlexRow>
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
