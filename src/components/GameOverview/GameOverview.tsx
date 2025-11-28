import { Button, Table } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { useStore } from '@/hooks/useStore.tsx';
import { Route as ResultRoute } from '@/routes/results/$resultID';

export const GameOverview: FunctionComponent = () => {
  const { gameOverview } = useStore();
  const navigate = useNavigate();

  const { t } = useTranslation();

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          {/* 1️⃣ Header strings */}
          <Table.Th>{t('table.date')}</Table.Th>
          <Table.Th>{t('table.time')}</Table.Th>
          <Table.Th>{t('table.location')}</Table.Th>
          <Table.Th>{t('table.playersCount')}</Table.Th>
          <Table.Th>{t('table.action')}</Table.Th>
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
                {start.toLocaleTimeString()} – {end ? end.toLocaleTimeString() : t('ellipsis')}
              </Table.Td>
              <Table.Td>{g.location}</Table.Td>
              <Table.Td>{g.playerCount}</Table.Td>
              <Table.Td>
                <Button
                  size="xs"
                  variant="outline"
                  mx="auto"
                  onClick={() =>
                    navigate({
                      to: ResultRoute.to,
                      params: { resultID: g.id },
                    })
                  }
                >
                  {t('buttons.view')}
                </Button>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
};
