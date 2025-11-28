import { createFileRoute } from '@tanstack/react-router';
import { CompletedScoreboard } from '@/components/CompletedScoreboard/CompletedScoreboard.tsx';
import { useStore } from '@/hooks/useStore.tsx';

function RouteComponent() {
  const { resultID } = Route.useParams();
  const { getGameById } = useStore();

  const game = getGameById(resultID);

  if (!game) {
    return <div>❌ Game not found.</div>;
  }

  return <CompletedScoreboard players={game.players} rounds={game.rounds} scores={game.scores} />;
}

export const Route = createFileRoute('/results/$resultID')({
  component: RouteComponent,
});
