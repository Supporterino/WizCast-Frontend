import { useEffect, useState } from 'react';
import { Alert, Box, Button, Group, NumberInput, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import { IconExclamationCircle, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { checkPermissions, getCurrentPosition, requestPermissions } from '@tauri-apps/plugin-geolocation';
import { useTranslation } from 'react-i18next';
import type { FormEvent, FunctionComponent } from 'react';
import { RuleModal } from '@/components/RuleModal/RuleModal.tsx';
import { Route as GameRoute } from '@/routes/game/playing.tsx';
import { useGame } from '@/hooks/useGame.tsx';

export const HomeScreen: FunctionComponent = () => {
  const navigate = useNavigate();
  const { setPlayers, startGame, setLocation } = useGame();
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();
  const [isValid, setIsValid] = useState<boolean>(false);

  const { t } = useTranslation();

  /* ────────────────────── Form Definition ────────────────────── */
  const form = useForm<{
    playerCount: number;
    players: Array<string>;
  }>({
    mode: 'controlled',
    validateInputOnChange: true,
    validateInputOnBlur: true,
    initialValues: {
      playerCount: 3,
      players: Array(3).fill(''),
    },

    /* ────────────────────── Validation ────────────────────── */
    validate: {
      players: (players) =>
        players.map((name) => {
          const trimmed = name.trim();
          if (trimmed === '') return t('errors.required');
          if (trimmed.length > 12) return t('errors.maxLength', { max: 12 });
          return null;
        }),
    },
  });

  useEffect(() => {
    const trimmed = form.getValues().players.map((name) => name.trim());
    const counts: Record<string, number> = {};
    trimmed.forEach((name) => {
      if (name !== '') counts[name] = (counts[name] ?? 0) + 1;
    });
    trimmed.every((name) => name === '' || counts[name] == 1) ? setIsValid(true) : setIsValid(false);
  });

  /* ────────────────────── Location helper ────────────────────── */
  const getLocation = async () => {
    let permissions = await checkPermissions();
    if (permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') {
      permissions = await requestPermissions(['location']);
    }

    if (permissions.location === 'granted') {
      const pos = await getCurrentPosition();
      return `${pos.coords.latitude} ${pos.coords.longitude}`;
    }
    return 'unknown';
  };

  /* ────────────────────── Sync player count with array length ────────────────────── */
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

  /* ────────────────────── Form submission ────────────────────── */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPlayers(form.getValues().players);
    setLocation(await getLocation());
    startGame();
    navigate({ to: GameRoute.to });
  };

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <form onSubmit={handleSubmit}>
        <Title c={'red'} mb={'lg'}>
          {t('titles.new')}
        </Title>

        {/* Player count controls */}
        <Group gap="xs">
          <Text mr="auto">{t('labels.numberOfPlayers')}</Text>

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
            clampBehavior={'strict'}
            allowDecimal={false}
            allowNegative={false}
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

        {/* Player name inputs */}
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
              <TextInput
                placeholder={t('placeholder.playerName', { index: index + 1 })}
                {...form.getInputProps(`players.${index}`)}
                style={{ flex: 1 }}
                required
                maxLength={12}
              />
            </Box>
          ))}
        </Box>

        {form.getValues().playerCount == 2 && (
          <Alert variant="light" color="blue" radius="md" title={t('alerts.playerCount.title')} icon={<IconInfoCircle stroke={1.5} />}>
            {t('alerts.playerCount.message')}
          </Alert>
        )}

        {!isValid && (
          <Alert variant="light" color="red" radius="md" title={t('alerts.invalidForm')} icon={<IconExclamationCircle stroke={1.5} />}>
            {t('errors.duplicate')}
          </Alert>
        )}

        {/* Action buttons */}
        <Group align="center" gap="md" style={{ marginTop: theme.spacing.xl }}>
          <Button onClick={open} variant="light">
            {t('buttons.rules')}
          </Button>
          <Button ml="auto" variant="filled" type="submit" disabled={!isValid}>
            {t('buttons.play')}
          </Button>
        </Group>
      </form>

      <RuleModal opened={opened} onClose={close} />
    </Box>
  );
};
