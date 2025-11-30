import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button, Container, Image, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';
import { Route as NewRoute } from '@/routes/game/new';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <Title order={1} ta="center" style={{ fontWeight: 700 }}>
            WizCast
          </Title>

          <Text ta="center" size="lg">
            {t('welcome.text')}
          </Text>

          <Image src="/logo.png" h={240} fit="contain" radius="md" />

          <Button size="lg" onClick={() => navigate({ to: NewRoute.to })}>
            {t("buttons.play")}
          </Button>
        </Stack>
      </FlexCol>
    </Container>
  );
};

export const Route = createFileRoute('/')({
  component: Home,
});
