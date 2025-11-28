import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button, Image, Text } from '@mantine/core';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';
import { Route as NewRoute } from '@/routes/game/new';

const Home = () => {
  const navigate = useNavigate();

  return (
    <FlexCol fullWidth>
      <Text>Welcome to WizCast</Text>
      <Image src="/logo.png" h={240} fit={'contain'} />
      <Button onClick={() => navigate({ to: NewRoute.to })}>Play</Button>
    </FlexCol>
  );
};

export const Route = createFileRoute('/')({
  component: Home,
});
