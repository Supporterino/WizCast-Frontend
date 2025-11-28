import { ActionIcon, Burger, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconBrightnessAuto, IconMoon, IconSettings, IconSun } from '@tabler/icons-react';
import classes from './Header.module.css';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

type HeaderProps = {
  opened: boolean;
  toggle: () => void;
};

export const Header: FunctionComponent<HeaderProps> = ({ toggle, opened }) => {
  const { setColorScheme, colorScheme } = useMantineColorScheme(); // returns 'light' | 'dark' | 'auto'
  const computedColorScheme = useComputedColorScheme(); // 'light' | 'dark' (resolved)

  const cycleColorScheme = () => {
    if (colorScheme === 'light') setColorScheme('dark');
    else if (colorScheme === 'dark') setColorScheme('auto');
    else setColorScheme('light');
  };

  const icon = {
    light: <IconSun className={classes.icon} stroke={1.5} />,
    dark: <IconMoon className={classes.icon} stroke={1.5} />,
    auto: <IconBrightnessAuto className={classes.icon} stroke={1.5} />,
  };

  return (
    <FlexRow fullWidth p="sm" gap="sm">
      <Burger opened={opened} onClick={toggle} size="sm" color={'red'} />
      <Text size={'lg'} fw={700} variant={'gradient'} gradient={{ from: 'red', to: 'orange', deg: 0 }}>
        WizCast
      </Text>
      <ActionIcon
        onClick={cycleColorScheme}
        variant="default"
        ml={'auto'}
        size="lg"
        aria-label="Toggle color scheme"
        title={`Current: ${colorScheme} (${computedColorScheme})`}
      >
        {icon[colorScheme]}
      </ActionIcon>
      <ActionIcon variant="default" size="lg">
        <IconSettings className={classes.icon} stroke={1.5} />
      </ActionIcon>
    </FlexRow>
  );
};
