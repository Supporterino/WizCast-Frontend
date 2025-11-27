import { createFileRoute } from '@tanstack/react-router';
import { GameScreen } from '@/components/GameScreen/GameScreen.tsx';

const RouteComponent = () => {
  return <GameScreen />;
};

export const Route = createFileRoute('/game/playing')({
  component: RouteComponent,
});
