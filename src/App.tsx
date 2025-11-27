import '@mantine/core/styles.css';

import { Button, MantineProvider, Stack, Text, createTheme, localStorageColorSchemeManager } from '@mantine/core';
import { Link, RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

function App() {
  const colorSchemeManager = localStorageColorSchemeManager({
    key: 'wizcast-frontend-color-scheme',
  });

  const globalTheme = createTheme({
    fontFamily: 'Open Sans, sans-serif',
    primaryColor: 'orange',
    autoContrast: true,
  });

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
          <Button component={Link} to="/" color="blue">
            Go home
          </Button>
        </Stack>
      );
    },
  });
  return (
    <MantineProvider theme={globalTheme} colorSchemeManager={colorSchemeManager} defaultColorScheme="auto">
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;
