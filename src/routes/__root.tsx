import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { AppShell, Container, ScrollArea,Text } from '@mantine/core';
import { useDisclosure, useViewportSize } from '@mantine/hooks';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useCallback, useRef } from 'react';
import type { TouchEvent } from 'react';

const SWIPE_THRESHOLD = 50; // Minimum distance to count as a swipe
const EDGE_THRESHOLD = 30; // How close to the edge the gesture must start

const Layout = () => {
    const [opened, { toggle, close }] = useDisclosure();
    const { height, width } = useViewportSize();

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
            header={{ height: 60 }}
            navbar={{
                width: 250,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
            withBorder
            h={height}
            w={width}
        >
            <AppShell.Header>
                <Text>WizCast</Text>
            </AppShell.Header>
            <AppShell.Navbar p={0} onTouchStart={handleNavbarTouchStart} onTouchEnd={handleNavbarTouchEnd}>
                <Text>NAV</Text>
            </AppShell.Navbar>
            <AppShell.Main
                h={height - 60}
                pb={0}
                px={width < 768 ? 0 : undefined}
                onTouchStart={handleMainTouchStart}
                onTouchEnd={handleMainTouchEnd}
            >
                <ScrollArea scrollbars="y" h={height - 60 - 2 * 16}>
                    <Container>
                        {/* bg="var(--mantine-color-blue-light)"> */}
                        <Outlet />
                        <TanStackRouterDevtools />
                    </Container>
                </ScrollArea>
            </AppShell.Main>
        </AppShell>
    );
};

export const Route = createRootRouteWithContext()({
    component: Layout,
});
