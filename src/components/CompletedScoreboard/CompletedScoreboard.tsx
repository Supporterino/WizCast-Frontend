import { Badge, Table, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import type { RoundData } from '@/contexts/GameProvider.tsx';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

type CompletedScoreboardProps = {
  players: Array<string>;
  rounds: Array<RoundData>;
  scores: Array<number>;
};

export const CompletedScoreboard: FunctionComponent<CompletedScoreboardProps> = ({ players, rounds, scores }) => {
  const { height } = useViewportSize();

  const { t } = useTranslation();

  const getScoreTillRound = (end: number) => {
    return rounds.slice(0, end).reduce((acc, r) => {
      r.scoreChanges.forEach((sc, i) => (sc ? (acc[i] += sc) : undefined));
      return acc;
    }, Array(players.length).fill(0));
  };

  const roundElements = rounds.map((round: RoundData, idx) => (
    <Table.Tr key={idx}>
      <Table.Td>
        <FlexRow>{idx + 1}</FlexRow>
      </Table.Td>

      {players.map((_, index) => {
        const roundScores = getScoreTillRound(idx + 1);
        return (
          <Table.Td key={index}>
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
          {roundElements}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
