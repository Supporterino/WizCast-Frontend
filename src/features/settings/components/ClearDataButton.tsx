import { Button, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import packageJson from '../../../../package.json';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';
import { useGame } from '@/shared/hooks/useGame.tsx';

export const ClearDataButton: FunctionComponent = () => {
  const { t } = useTranslation();
  const { endGame } = useGame();
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVersionClick = () => {
    clickCountRef.current += 1;
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        timerRef.current = null;
      }, 500);
    }
    if (clickCountRef.current === 3) {
      navigate({ to: '/debug' });
      clickCountRef.current = 0;
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <>
      <FlexRow fullWidth>
        <Text>{t('settingsMenu.clear')}</Text>
        <Button ml="auto" onClick={() => endGame()}>
          Ok
        </Button>
      </FlexRow>
      <Text mt="auto" size="xs" c="dimmed" onClick={handleVersionClick}>
        Frontend v{packageJson.version}
      </Text>
    </>
  );
};
