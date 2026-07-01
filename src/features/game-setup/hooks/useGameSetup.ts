import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import type { NumberInputHandlers } from '@mantine/core';
import type { FormEvent } from 'react';
import { useGame } from '@/shared/hooks/useGame.tsx';
import { getGeoLocation } from '@/shared/services/geolocation.ts';
import { Route as GameRoute } from '@/routes/game/playing.tsx';

export function useGameSetup() {
  const navigate = useNavigate();
  const { setPlayers, startGame, setLocation } = useGame();
  const { t } = useTranslation();
  const [isValid, setIsValid] = useState<boolean>(false);
  const handlersRef = useRef<NumberInputHandlers>(null);

  const form = useForm<{
    playerCount: number;
    players: Array<string>;
  }>({
    mode: 'uncontrolled',
    initialValues: {
      playerCount: 3,
      players: Array(3).fill(''),
    },
    validate: {
      players: (value) =>
        value.every((player) => player.trim() !== '')
          ? value.every((player) => player.trim().length < 12)
            ? null
            : t('errors.maxLength', { max: 12 })
          : t('errors.required'),
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

  const getLocation = useCallback(async () => {
    const coords = await getGeoLocation();
    return coords ? `${coords.lat} ${coords.lng}` : 'unknown';
  }, []);

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

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.validate();
    if (form.isValid()) {
      setPlayers(form.getValues().players);
      setLocation(await getLocation());
      startGame();
      navigate({ to: GameRoute.to });
    }
  }, [form, setPlayers, setLocation, startGame, navigate, getLocation]);

  return { form, isValid, handlersRef, handleSubmit };
}
