import { createFileRoute } from '@tanstack/react-router';
import { GameOverviewPage } from '@/features/results/GameOverviewPage.tsx';

const RouteComponent = () => {
  return <GameOverviewPage />;
};

export const Route = createFileRoute('/results/overview')({
  component: RouteComponent,
});
