import { ActionIcon, Button, Divider, Select, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconBrightnessAuto, IconMoon, IconSun } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import packageJson from '../../../package.json';
import type { FunctionComponent } from 'react';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { useGame } from '@/hooks/useGame.tsx';

export const SettingsMenu: FunctionComponent = () => {
  const { setColorScheme, colorScheme } = useMantineColorScheme(); // 'light' | 'dark' | 'auto'
  const computedColorScheme = useComputedColorScheme(); // resolved to 'light' | 'dark'
  const { endGame } = useGame();
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleVersionClick = () => {
    clickCountRef.current += 1;

    // Reset counter if more than 500ms has passed since the first click
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        timerRef.current = null;
      }, 500);
    }

    if (clickCountRef.current === 3) {
      // Navigate to the debug route
      navigate({ to: '/debug' });
      // Reset counter and timer
      clickCountRef.current = 0;
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const cycleColorScheme = () => {
    if (colorScheme === 'light') setColorScheme('dark');
    else if (colorScheme === 'dark') setColorScheme('auto');
    else setColorScheme('light');
  };

  const icon = {
    light: <IconSun stroke={1.5} />,
    dark: <IconMoon stroke={1.5} />,
    auto: <IconBrightnessAuto stroke={1.5} />,
  };

  const { t, i18n } = useTranslation();

  return (
    <FlexCol fullWidth h={'100%'}>
      <Divider my="xs" label={t('settingsMenu.general')} labelPosition="left" w={'100%'} />
      <FlexRow fullWidth align="center">
        <Text>{t('settingsMenu.label')}</Text>
        <ActionIcon
          ml="auto"
          onClick={cycleColorScheme}
          variant="default"
          size="lg"
          aria-label={t('settingsMenu.ariaLabel')}
          title={t('settingsMenu.title', {
            colorScheme,
            computedColorScheme,
          })}
        >
          {icon[colorScheme]}
        </ActionIcon>
      </FlexRow>
      <FlexRow fullWidth>
        <Text>{t('settingsMenu.labelLanguage')}</Text>
        <Select
          ml={'auto'}
          value={i18n.language}
          onChange={(value) => i18n.changeLanguage(value!)}
          data={[
            { value: 'en', label: 'English' },
            { value: 'de', label: 'Deutsch' },
          ]}
          style={{ minWidth: 120, marginLeft: 12 }}
        />
      </FlexRow>
      <Divider my="xs" label={t('settingsMenu.developer')} labelPosition="left" w={'100%'} />
      <FlexRow fullWidth>
        <Text>{t('settingsMenu.clear')}</Text>
        <Button ml={'auto'} onClick={() => endGame()}>
          Ok
        </Button>
      </FlexRow>
      <Text mt={'auto'} size="xs" c="dimmed" onClick={handleVersionClick}>
        Frontend v{packageJson.version}
      </Text>
    </FlexCol>
  );
};
