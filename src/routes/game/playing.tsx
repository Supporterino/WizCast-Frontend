import { createFileRoute } from '@tanstack/react-router';
import { GameScreen } from '@/features/host-game/GameScreen.tsx';

const RouteComponent = () => {
  return <GameScreen />;
};

export const Route = createFileRoute('/game/playing')({
  component: RouteComponent,
});
