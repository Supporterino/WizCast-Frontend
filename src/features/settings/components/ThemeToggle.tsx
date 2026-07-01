import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconBrightnessAuto, IconMoon, IconSun } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';

export const ThemeToggle: FunctionComponent = () => {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  const icon = {
    light: <IconSun stroke={1.5} />,
    dark: <IconMoon stroke={1.5} />,
    auto: <IconBrightnessAuto stroke={1.5} />,
  };

  const cycleColorScheme = () => {
    if (colorScheme === 'light')
      document.startViewTransition(() => {
        setColorScheme('dark');
      });
    else if (colorScheme === 'dark') setColorScheme('auto');
    else
      document.startViewTransition(() => {
        setColorScheme('light');
      });
  };

  return (
    <ActionIcon
      ml="auto"
      onClick={cycleColorScheme}
      variant="default"
      size="lg"
      aria-label={t('settingsMenu.ariaLabel')}
      title={t('settingsMenu.title', { colorScheme })}
    >
      {icon[colorScheme]}
    </ActionIcon>
  );
};
