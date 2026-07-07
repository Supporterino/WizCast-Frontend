import type { FunctionComponent } from 'react';
import { useState } from 'react';
import { useStore } from '@/shared/hooks/useStore.tsx';
import { DeleteGameModal } from './components/DeleteGameModal.tsx';
import { GameListTable } from './components/GameListTable.tsx';

export const GameOverviewPage: FunctionComponent = () => {
  const { gameOverview, deleteGameById } = useStore();
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
      <DeleteGameModal opened={modalOpened} onClose={() => setModalOpened(false)} onConfirm={handleDelete} />
      <GameListTable games={gameOverview} onDelete={confirmDelete} />
    </>
  );
};
