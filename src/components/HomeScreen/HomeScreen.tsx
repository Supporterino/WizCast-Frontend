import React, { useEffect } from 'react';
import { Alert, Box, Button, Group, NumberInput, Text, TextInput, useMantineTheme } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { checkPermissions, getCurrentPosition, requestPermissions } from '@tauri-apps/plugin-geolocation';
import { RuleModal } from '@/components/RuleModal/RuleModal.tsx';
import { Route as GameRoute } from '@/routes/game/playing.tsx';
import { useGame } from '@/hooks/useGame.tsx';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setPlayers, startGame, setLocation } = useGame();
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      playerCount: 3,
      players: Array(3).fill(''),
    },
  });

  const getLocation = async () => {
    let permissions = await checkPermissions();
    if (permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') {
      permissions = await requestPermissions(['location']);
    }

    if (permissions.location === 'granted') {
      const pos = await getCurrentPosition();
      return `${pos.coords.latitude} ${pos.coords.longitude}`;
    } else return 'unknown';
  };

  useEffect(() => {
    const count = form.getValues().playerCount;
    const current = form.getValues().players;

    if (count > current.length) {
      const added = Array(count - current.length).fill('');
      form.setFieldValue('players', [...current, ...added]);
    } else if (count < current.length) {
      form.setFieldValue('players', current.slice(0, count));
    }
  }, [form.getValues().playerCount]);

  return (
    <Box
      style={{
        position: 'relative',
        minHeight: '100%',
      }}
    >
      <form
        onSubmit={form.onSubmit(async (values) => {
          setPlayers(values.players);
          setLocation(await getLocation());
          startGame();
          navigate({ to: GameRoute.to });
        })}
      >
        <Group gap="xs">
          <Text mr={'auto'}>Number of Players</Text>
          <Button
            variant="light"
            onClick={() => form.setFieldValue('playerCount', Math.max(2, form.values.playerCount - 1))}
            disabled={form.values.playerCount <= 2}
          >
            –
          </Button>
          <NumberInput
            value={form.values.playerCount}
            min={2}
            max={6}
            onChange={(value) => form.setFieldValue('playerCount', +value)}
            style={{ width: 40 }}
            hideControls
          />
          <Button
            variant="light"
            onClick={() => form.setFieldValue('playerCount', Math.min(6, form.values.playerCount + 1))}
            disabled={form.values.playerCount >= 6}
          >
            +
          </Button>
        </Group>

        <Box style={{ marginTop: theme.spacing.lg }}>
          {form.values.players.map((_, index) => (
            <Box
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: theme.spacing.sm,
              }}
            >
              <TextInput placeholder={`Player ${index + 1} name`} {...form.getInputProps(`players.${index}`)} style={{ flex: 1 }} />
            </Box>
          ))}
        </Box>

        {form.getValues().playerCount == 2 && (
          <Alert variant="light" color="blue" radius="md" title="Player Count" icon={<IconInfoCircle stroke={1.5} />}>
            The game is designed for 3-6 players but can be played with two players when special rules are used.
          </Alert>
        )}

        <Group align="center" gap="md" style={{ marginTop: theme.spacing.xl }}>
          <Button onClick={open} variant={'light'}>
            Rules
          </Button>
          <Button ml={'auto'} variant="filled" type={'submit'}>
            Play
          </Button>
        </Group>
      </form>

      <RuleModal opened={opened} onClose={close} />
    </Box>
  );
};
