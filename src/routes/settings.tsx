import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/features/settings/SettingsPage.tsx';

function RouteComponent() {
  return <SettingsPage />;
}

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
});
