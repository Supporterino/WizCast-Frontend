import { Button, Table } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import type { FunctionComponent } from 'react';
import { useStore } from '@/hooks/useStore.tsx';
import { Route as ResultRoute } from '@/routes/results/$resultID';

export const GameOverview: FunctionComponent = () => {
  const { gameOverview } = useStore();
  const navigate = useNavigate();

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Time</Table.Th>
          <Table.Th>Location</Table.Th>
          <Table.Th># Players</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {gameOverview.map((g) => {
          const start = new Date(g.startDate);
          const end = g.endDate ? new Date(g.endDate) : null;

          return (
            <Table.Tr key={g.id}>
              <Table.Td>{start.toLocaleDateString()}</Table.Td>
              <Table.Td>
                {start.toLocaleTimeString()} – {end ? end.toLocaleTimeString() : '…'}
              </Table.Td>
              <Table.Td>{g.location}</Table.Td>
              <Table.Td>{g.playerCount}</Table.Td>
              <Table.Td>
                <Button
                  size="xs"
                  variant="outline"
                  mx={'auto'}
                  onClick={() =>
                    navigate({
                      to: ResultRoute.to,
                      params: { resultID: g.id },
                    })
                  }
                >
                  View
                </Button>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
};
