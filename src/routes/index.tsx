import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button, Container, Image, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';
import { Route as NewRoute } from '@/routes/game/new';

const Home = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();

  return (
    <Container
      fluid
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FlexCol fullWidth>
        <Stack align="center" gap={20} style={{ maxWidth: 400, margin: '0 auto' }}>
          <Title order={1} ta="center" style={{ color: theme.white, fontWeight: 700 }}>
            WizCast
          </Title>

          <Text ta="center" size="lg" c={theme.white}>
            A magical journey awaits
          </Text>

          <Image src="/logo.png" h={240} fit="contain" radius="md" />

          <Button size="lg" onClick={() => navigate({ to: NewRoute.to })}>
            Play
          </Button>
        </Stack>
      </FlexCol>
    </Container>
  );
};

export const Route = createFileRoute('/')({
  component: Home,
});
