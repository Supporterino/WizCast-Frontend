import { createFileRoute } from '@tanstack/react-router';
import { useStore } from '@/shared/hooks/useStore.tsx';
import { GameResultPage } from '@/features/results/GameResultPage.tsx';

function RouteComponent() {
  const { resultID } = Route.useParams();
  const { getGameById } = useStore();
  const game = getGameById(resultID);

  if (!game) {
    return <div>Game not found.</div>;
  }

  return <GameResultPage game={game} />;
}

export const Route = createFileRoute('/results/$resultID')({
  component: RouteComponent,
});
