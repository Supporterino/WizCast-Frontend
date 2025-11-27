import { useMemo } from 'react';
import { Badge, Box, Group, ScrollArea, Table, Text } from '@mantine/core';
import type { RoundData } from '@/contexts/ScoreboardProvider.tsx';
import { useScoreboard } from '@/hooks/useScoreboard.tsx';

export const CompletedScoreboard = () => {
  const { players, rounds, scores } = useScoreboard();

  const renderValue = (value: number | undefined) => (value === undefined ? <Text c="dimmed">—</Text> : <Text>{value}</Text>);

  const rows = useMemo(() => {
    return rounds.map((r: RoundData) => (
      <tr key={r.id}>
        {/* round number */}
        <td>{r.id + 1}</td>

        {/* per‑player cells */}
        {players.map((_, i) => (
          <td key={i}>
            <Group gap={4} align="center">
              {/* Prediction */}
              {renderValue(r.predictions[i])}
              {/* Actual */}
              {renderValue(r.actuals[i])}
              {/* Δ – badge with colour */}
              {r.scoreChanges[i] !== undefined ? (
                <Badge color={r.scoreChanges[i] >= 0 ? 'green' : 'red'} variant="light">
                  {r.scoreChanges[i].toString()}
                </Badge>
              ) : (
                <Text color="dimmed">—</Text>
              )}
            </Group>
          </td>
        ))}

        {/* cumulative score after this round */}
        <td>
          {scores.reduce((sum, s) => sum + s, 0)} {/* or keep a running total */}
        </td>
      </tr>
    ));
  }, [rounds, players, scores]);

  /* ------------------------------------------------------------------ */
  return (
    <Box>
      <Table striped highlightOnHover verticalSpacing="xs" horizontalSpacing="md">
        <thead>
          <tr>
            <th>#</th>
            {players.map((p, i) => (
              <th key={i}>{p}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>

        {/* Body – wrapped in ScrollArea so header stays fixed */}
        <ScrollArea style={{ maxHeight: 400 }}>
          <tbody>{rows}</tbody>
        </ScrollArea>
      </Table>
    </Box>
  );
};
