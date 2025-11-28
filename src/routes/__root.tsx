import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { AppShell, Container } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Header } from '@/components/Header/Header.tsx';

const Layout = () => {
  const { height, width } = useViewportSize();

  return (
    <AppShell header={{ height: 60 }} padding="md" withBorder h={height} w={width}>
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Main h={height - 60} pb={0}>
        <Container h={height - 60 - 2 * 16}>
          {/* bg = "var(--mantine-color-blue-light)" > */}
          <Outlet />
          <TanStackRouterDevtools />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export const Route = createRootRouteWithContext()({
  component: Layout,
});
