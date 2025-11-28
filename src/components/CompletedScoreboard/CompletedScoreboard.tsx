import { Badge, Table, Text } from '@mantine/core';
import type { RoundData } from '@/contexts/ScoreboardProvider.tsx';
import { useScoreboard } from '@/hooks/useScoreboard.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { useViewportSize } from '@mantine/hooks';

export const CompletedScoreboard = () => {
  const { players, rounds, scores } = useScoreboard();
  const { height, width } = useViewportSize();

  const getScoreTillRound = (end: number) => {
    const result = rounds.slice(0, end).reduce((acc, r) => {
      r.scoreChanges.forEach((sc, i) => (sc ? (acc[i] += sc) : undefined));
      return acc;
    }, Array(players.length).fill(0));

    return result;
  };

  const roundElements = rounds.map((round: RoundData, idx) => (
    <Table.Tr key={idx}>
      <Table.Td>
        <FlexRow>{idx + 1}</FlexRow>
      </Table.Td>
      {players.map((_, index) => {
        const roundScores = getScoreTillRound(idx + 1);
        return (
          <Table.Td>
            <FlexRow>
              <Text>{roundScores[index]}</Text>
              <Text size={'sm'} c={'dimmed'}>
                ({round.scoreChanges[index]})
              </Text>
              <Badge color={round.actuals[index] == round.predictions[index] ? 'green' : 'red'}>
                {round.actuals[index]} / {round.predictions[index]}
              </Badge>
            </FlexRow>
          </Table.Td>
        );
      })}
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={width} maxHeight={height - 100}>
    <Table stickyHeader withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <FlexRow>Round</FlexRow>
          </Table.Th>
          {players.map((player) => (
            <Table.Th>
              <FlexRow>{player}</FlexRow>
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {roundElements}
        <Table.Tr>
          <Table.Td>
            <FlexRow>
              <Text>Final</Text>
            </FlexRow>
          </Table.Td>

          {players.map((_, index) => (
            <Table.Td>
              <FlexRow>
                <Text>{scores[index]}</Text>
              </FlexRow>
            </Table.Td>
          ))}
        </Table.Tr>
      </Table.Tbody>
    </Table>
      </Table.ScrollContainer>
  );
};
