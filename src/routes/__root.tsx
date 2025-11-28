import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { AppShell, Container } from '@mantine/core';
import { useDisclosure, useViewportSize } from '@mantine/hooks';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Header } from '@/components/Header/Header.tsx';
import { NavBar } from '@/components/NavBar/NavBar.tsx';

const Layout = () => {
  const { height, width } = useViewportSize();
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
      withBorder
      h={height}
      w={width}
    >
      <AppShell.Header>
        <Header toggle={toggle} opened={opened} />
      </AppShell.Header>
      <AppShell.Navbar p={0}>
        <NavBar closeNav={close} />
      </AppShell.Navbar>
      <AppShell.Main h={height - 60} pb={0} px={width < 768 ? 0 : undefined}>
        <Container h={height - 60 - 2 * 16}>
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
