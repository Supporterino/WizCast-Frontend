import { ActionIcon, Button, Modal, Table } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { IconEye, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import type { FunctionComponent } from 'react';
import { useStore } from '@/hooks/useStore.tsx';
import { Route as ResultRoute } from '@/routes/results/$resultID';

export const GameOverview: FunctionComponent = () => {
  const { gameOverview, deleteGameById } = useStore();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setModalOpened(true);
  };

  const handleDelete = () => {
    if (deleteId) deleteGameById(deleteId);
    setModalOpened(false);
    setDeleteId(null);
  };

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={t('gameOverview.deleteConfirmationTitle')}
      >
        <p>{t('gameOverview.deleteConfirmationMessage')}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <Button variant="default" onClick={() => setModalOpened(false)}>
            {t('gameOverview.cancel')}
          </Button>
          <Button color="red" onClick={handleDelete}>
            {t('gameOverview.delete')}
          </Button>
        </div>
      </Modal>

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
                  <ActionIcon
                    size="sm"
                    ml="auto"
                    mr={'lg'}
                    onClick={() =>
                      navigate({
                        to: ResultRoute.to,
                        params: { resultID: g.id },
                      })
                    }
                  >
                    <IconEye stroke={1.5} />
                  </ActionIcon>
                  {/* Delete icon now opens the confirmation modal */}
                  <ActionIcon size="sm" mr="auto" onClick={() => confirmDelete(g.id)}>
                    <IconTrash stroke={1.5} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </>
  );
};
