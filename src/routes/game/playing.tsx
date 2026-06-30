import { createFileRoute } from '@tanstack/react-router';
import { GameScreen } from '@/components/GameScreen/GameScreen.tsx';
import { ConnectionProvider } from '@/contexts/ConnectionProvider.tsx';

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
