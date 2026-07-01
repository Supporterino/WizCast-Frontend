import { createFileRoute } from '@tanstack/react-router';
import { ConnectionProvider } from '@/contexts/ConnectionProvider.tsx';
import { GameScreen } from '@/features/host-game/GameScreen.tsx';

const RouteComponent = () => {
  return (
    <ConnectionProvider>
      <GameScreen />
    </ConnectionProvider>
  );
};

export const Route = createFileRoute('/game/playing')({
  component: RouteComponent,
});
