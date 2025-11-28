import { createFileRoute } from '@tanstack/react-router';
import { HomeScreen } from '@/components/HomeScreen/HomeScreen.tsx';

const RouteComponent = () => {
  return <HomeScreen />;
};

export const Route = createFileRoute('/game/new')({
  component: RouteComponent,
});
