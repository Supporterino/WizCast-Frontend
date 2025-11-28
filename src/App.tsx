import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './i18n/i18n';

import { Button, MantineProvider, Stack, Text, createTheme, localStorageColorSchemeManager } from '@mantine/core';
import { Link, RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { GameProvider } from '@/contexts/GameProvider.tsx';
import { StoreProvider } from '@/contexts/StoreProvider.tsx';

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

  return <RouterProvider router={router} />;
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
      <StoreProvider>
        <GameProvider>
          <InnerApp />
        </GameProvider>
      </StoreProvider>
    </MantineProvider>
  );
}

export default App;
