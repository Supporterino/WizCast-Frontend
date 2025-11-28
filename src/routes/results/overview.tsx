import { createFileRoute } from '@tanstack/react-router';
import { GameOverview } from '@/components/GameOverview/GameOverview.tsx';

const RouteComponent = () => {
  return <GameOverview />;
};

export const Route = createFileRoute('/results/overview')({
  component: RouteComponent,
});
