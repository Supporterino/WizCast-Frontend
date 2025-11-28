import { createFileRoute } from '@tanstack/react-router';
import { SettingsMenu } from '@/components/SettingsMenu/SettingsMenu.tsx';

function RouteComponent() {
  return <SettingsMenu />;
}

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
});
