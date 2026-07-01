import { createFileRoute } from '@tanstack/react-router';
import { DebugPage } from '@/features/debug/DebugPage.tsx';

const RouteComponent = () => {
  return <DebugPage />;
};

export const Route = createFileRoute('/debug')({
  component: RouteComponent,
});
