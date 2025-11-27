import { createFileRoute } from '@tanstack/react-router';
import { HomeScreen } from '@/components/HomeScreen/HomeScreen.tsx';

const Home = () => {
  return <HomeScreen />;
};

export const Route = createFileRoute('/')({
  component: Home,
});
