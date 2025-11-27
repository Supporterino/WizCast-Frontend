import { createFileRoute } from '@tanstack/react-router';
import { CompletedScoreboard } from '@/components/CompletedScoreboard/CompletedScoreboard.tsx';

const RouteComponent = () => {
  return <CompletedScoreboard />;
};

export const Route = createFileRoute('/game/result')({
  component: RouteComponent,
});
