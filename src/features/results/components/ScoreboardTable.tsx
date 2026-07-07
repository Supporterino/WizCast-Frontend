import { Badge, Table, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';
import type { RoundData } from '@/types/game.ts';
import { getScoreTillRound } from '@/utils/scoring.ts';

interface ScoreboardTableProps {
  players: Array<string>;
  rounds: Array<RoundData>;
  scores: Array<number>;
}

export const ScoreboardTable: FunctionComponent<ScoreboardTableProps> = ({ players, rounds, scores }) => {
  const { height } = useViewportSize();
  const { t } = useTranslation();

  const roundElements = rounds.map((round, idx) => (
    <Table.Tr key={round.id}>
      <Table.Td>
        <FlexRow>{idx + 1}</FlexRow>
      </Table.Td>
      {players.map((_, index) => {
        const roundScores = getScoreTillRound(rounds, idx + 1, players.length);
        return (
          <Table.Td key={`${round.id}-${_}`}>
            <FlexRow fullWidth>
              <Text>{roundScores[index]}</Text>
              <Text size="sm" c="dimmed">
                ({round.scoreChanges[index]})
              </Text>
              <Badge color={round.actuals[index] === round.predictions[index] ? 'green' : 'red'}>
                {round.actuals[index]} / {round.predictions[index]}
              </Badge>
            </FlexRow>
          </Table.Td>
        );
      })}
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={200 * players.length} maxHeight={height - 100}>
      <Table stickyHeader withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th></Table.Th>
            {players.map((player) => (
              <Table.Th key={player}>
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
            {players.map((player, index) => (
              <Table.Td key={player}>
                <FlexRow>
                  <Text>{scores[index]}</Text>
                </FlexRow>
              </Table.Td>
            ))}
          </Table.Tr>
          {roundElements}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
