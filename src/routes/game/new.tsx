import { createFileRoute } from '@tanstack/react-router';
import { GameSetupPage } from '@/features/game-setup/GameSetupPage.tsx';

const RouteComponent = () => {
  return <GameSetupPage />;
};

export const Route = createFileRoute('/game/new')({
  component: RouteComponent,
});
