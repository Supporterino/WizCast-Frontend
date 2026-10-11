import { AppShell, Container } from '@mantine/core';
import { useDisclosure, useViewportSize } from '@mantine/hooks';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { TouchEvent } from 'react';
import { useCallback, useRef } from 'react';
import { Header } from '@/shared/components/Header/Header.tsx';
import { NavBar } from '@/shared/components/NavBar/NavBar.tsx';
import { useStatusBarStyle } from '@/shared/hooks/useStatusBarStyle.ts';

const SWIPE_THRESHOLD = 50; // Minimum distance to count as a swipe
const EDGE_THRESHOLD = 30; // How close to the edge the gesture must start

const Layout = () => {
  const { height, width } = useViewportSize();
  const [opened, { toggle, close }] = useDisclosure();

  useStatusBarStyle();

  const openStartX = useRef<number | null>(null);
  const handleMainTouchStart = useCallback(
    (e: TouchEvent) => {
      if (width < 768 && !opened) {
        openStartX.current = e.touches[0].clientX;
      }
    },
    [width, opened],
  );
  const handleMainTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (width < 768 && !opened && openStartX.current !== null) {
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - openStartX.current;

        if (openStartX.current < EDGE_THRESHOLD && deltaX > SWIPE_THRESHOLD) {
          toggle();
        }
      }
      openStartX.current = null;
    },
    [width, opened, toggle],
  );
  const closeStartX = useRef<number | null>(null);

  const handleNavbarTouchStart = useCallback(
    (e: TouchEvent) => {
      if (width < 768 && opened) {
        closeStartX.current = e.touches[0].clientX;
      }
    },
    [width, opened],
  );
  const handleNavbarTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (width < 768 && opened && closeStartX.current !== null) {
        const endX = e.changedTouches[0].clientX;
        const deltaX = closeStartX.current - endX;

        if (closeStartX.current > width - EDGE_THRESHOLD && deltaX > SWIPE_THRESHOLD) {
          close();
        }
      }
      closeStartX.current = null;
    },
    [width, opened, close],
  );

  return (
    <AppShell
      header={{ height: 'calc(60px + env(safe-area-inset-top, 0px))' }}
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
      <AppShell.Navbar
        p={0}
        pb={'env(safe-area-inset-bottom, 0px)'}
        pl={'env(safe-area-inset-left, 0px)'}
        pr={'env(safe-area-inset-right, 0px)'}
        onTouchStart={handleNavbarTouchStart}
        onTouchEnd={handleNavbarTouchEnd}
      >
        <NavBar closeNav={close} />
      </AppShell.Navbar>
      <AppShell.Main
        pb={'env(safe-area-inset-bottom, 0px)'}
        pl={
          width < 768
            ? 'env(safe-area-inset-left, 0px)'
            : 'calc(var(--app-shell-navbar-offset, 0rem) + var(--app-shell-padding, 0rem) + env(safe-area-inset-left, 0px))'
        }
        pr={
          width < 768
            ? 'env(safe-area-inset-right, 0px)'
            : 'calc(var(--app-shell-aside-offset, 0rem) + var(--app-shell-padding, 0rem) + env(safe-area-inset-right, 0px))'
        }
        onTouchStart={handleMainTouchStart}
        onTouchEnd={handleMainTouchEnd}
      >
        <Container h={`calc(${height - 60 - 2 * 16}px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))`} p={'xs'}>
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
