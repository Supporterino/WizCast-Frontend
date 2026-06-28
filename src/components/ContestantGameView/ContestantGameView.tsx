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
}

export const ContestantGameView: FunctionComponent<ContestantGameViewProps> = ({ players, rounds, scores }) => {
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
            return (
              <Table.Tr key={idx}>
                <Table.Td>
                  <FlexRow>{idx + 1}</FlexRow>
                </Table.Td>
                {players.map((_, index) => (
                  <Table.Td key={index}>
                    <FlexRow fullWidth>
                      <Text>{roundScores[index]}</Text>
                      <Text size="sm" c="dimmed">
                        ({round.scoreChanges[index]})
                      </Text>
                    </FlexRow>
                  </Table.Td>
                ))}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
