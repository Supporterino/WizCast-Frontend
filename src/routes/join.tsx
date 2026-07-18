import { createFileRoute } from '@tanstack/react-router';
import { ContestantGamePage } from '@/features/contestant-game/ContestantGamePage.tsx';

function JoinPageWrapper() {
  return <ContestantGamePage />;
}

export const Route = createFileRoute('/join')({
  component: JoinPageWrapper,
});
