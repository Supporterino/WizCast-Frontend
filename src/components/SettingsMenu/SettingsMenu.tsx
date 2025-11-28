import {
  ActionIcon,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
  Select,                     // <-- added
} from '@mantine/core';
import { IconBrightnessAuto, IconMoon, IconSun } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

export const SettingsMenu: FunctionComponent = () => {
  const { setColorScheme, colorScheme } = useMantineColorScheme(); // 'light' | 'dark' | 'auto'
  const computedColorScheme = useComputedColorScheme(); // resolved to 'light' | 'dark'

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
    <FlexCol fullWidth>
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
          ml={"auto"}
          value={i18n.language}
          onChange={(value) => i18n.changeLanguage(value!)}
          data={[
            { value: 'en', label: 'English' },
            { value: 'de', label: 'Deutsch' },
          ]}
          style={{ minWidth: 120, marginLeft: 12 }}
        />
      </FlexRow>
    </FlexCol>
  );
};
