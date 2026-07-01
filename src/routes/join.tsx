import { createFileRoute } from '@tanstack/react-router';
import { ConnectionProvider } from '@/contexts/ConnectionProvider.tsx';
import { ContestantGamePage } from '@/features/contestant-game/ContestantGamePage.tsx';

function JoinPageWrapper() {
  return (
    <ConnectionProvider>
      <ContestantGamePage />
    </ConnectionProvider>
  );
}

export const Route = createFileRoute('/join')({
  component: JoinPageWrapper,
});
