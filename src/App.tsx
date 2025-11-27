import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { Button, MantineProvider, Stack, Text, createTheme, localStorageColorSchemeManager } from '@mantine/core';
import { Link, RouterProvider, createRouter } from '@tanstack/react-router';
import { Notifications } from '@mantine/notifications';
import { routeTree } from './routeTree.gen';
import { PlayersProvider } from '@/contexts/PlayerProvider.tsx';
import { RulesProvider } from '@/contexts/RulesProvider.tsx';
import { ScoreboardProvider } from '@/contexts/ScoreboardProvider.tsx';
import { usePlayers } from '@/hooks/usePlayers.tsx';

const InnerApp = () => {
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 3000,
    defaultStaleTime: 10000,
    scrollRestoration: true,
    defaultNotFoundComponent: () => {
      return (
        <Stack
          align="center"
          gap="md"
          style={(theme) => ({
            maxWidth: 480,
            margin: 'auto',
            padding: theme.spacing.lg,
          })}
        >
          <Text size="xl" fw="500" ta="center">
            Not found!
          </Text>
          <Button component={Link} to="/">
            Go home
          </Button>
        </Stack>
      );
    },
  });

  const { players } = usePlayers();
  return (
    <RulesProvider>
      <ScoreboardProvider players={players}>
        <Notifications position="top-center" />
        <RouterProvider router={router} />
      </ScoreboardProvider>
    </RulesProvider>
  );
};

function App() {
  const colorSchemeManager = localStorageColorSchemeManager({
    key: 'wizcast-frontend-color-scheme',
  });

  const globalTheme = createTheme({
    fontFamily: 'Open Sans, sans-serif',
    primaryColor: 'red',
    autoContrast: true,
  });

  return (
    <MantineProvider theme={globalTheme} colorSchemeManager={colorSchemeManager} defaultColorScheme="auto">
      <PlayersProvider>
        <InnerApp />
      </PlayersProvider>
    </MantineProvider>
  );
}

export default App;
