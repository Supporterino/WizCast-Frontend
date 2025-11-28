// src/components/SettingsMenu.tsx

import { ActionIcon, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconBrightnessAuto, IconMoon, IconSun } from '@tabler/icons-react';
import type { FunctionComponent } from 'react';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

/**
 * SettingsMenu
 *
 * This component will eventually contain all application settings.
 * At the moment it only exposes a theme‑toggle button and the
 * placeholder Settings icon.  Keeping this logic isolated makes it
 * trivial to replace or extend the UI later without touching
 * the Header component.
 */
export const SettingsMenu: FunctionComponent = () => {
  const { setColorScheme, colorScheme } = useMantineColorScheme(); // 'light' | 'dark' | 'auto'
  const computedColorScheme = useComputedColorScheme(); // resolved to 'light' | 'dark'

  /** Cycle through light → dark → auto → light … */
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

  return (
    <FlexCol fullWidth>
      <FlexRow fullWidth>
        <Text>Color Scheme</Text>
        <ActionIcon
          ml={'auto'}
          onClick={cycleColorScheme}
          variant="default"
          size="lg"
          aria-label="Toggle color scheme"
          title={`Current: ${colorScheme} (${computedColorScheme})`}
        >
          {icon[colorScheme]}
        </ActionIcon>
      </FlexRow>
    </FlexCol>
  );
};
