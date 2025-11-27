import { createFileRoute } from '@tanstack/react-router';
import { Stack, Title } from '@mantine/core';

const Home = () => {
  return (
    <Stack align="center" gap="lg">
      <Title order={1} ta="center" fw={800}>
        Welcome to WizCast
      </Title>
    </Stack>
  );
};

export const Route = createFileRoute('/')({
  component: Home,
});
