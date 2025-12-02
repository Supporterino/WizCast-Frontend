import { ActionIcon, Button, Divider, Select, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconBrightnessAuto, IconMoon, IconSun } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
// import { useDisclosure } from '@mantine/hooks';
// import { useState } from 'react';
import packageJson from '../../../package.json';
import type { FunctionComponent } from 'react';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { useGame } from '@/hooks/useGame.tsx';
// import { DebugModal } from '@/DebugModal/DebugModal.tsx';
// import { useStore } from '@/hooks/useStore.tsx';

export const SettingsMenu: FunctionComponent = () => {
  const { setColorScheme, colorScheme } = useMantineColorScheme(); // 'light' | 'dark' | 'auto'
  const computedColorScheme = useComputedColorScheme(); // resolved to 'light' | 'dark'
  const { endGame } = useGame();

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

  // const [debugData, setDebugData] = useState('');
  // const [opened, { open, close }] = useDisclosure(false);
  // const { completedGames } = useStore();

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
      {/* <FlexRow fullWidth>*/}
      {/*  <Text>Show game state</Text>*/}
      {/*  <Button*/}
      {/*    ml={'auto'}*/}
      {/*    onClick={() => {*/}
      {/*      setDebugData(JSON.stringify(rounds, null, 2));*/}
      {/*      open();*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    Open*/}
      {/*  </Button>*/}
      {/* </FlexRow>*/}
      {/* <FlexRow fullWidth>*/}
      {/*  <Text>Show stored state</Text>*/}
      {/*  <Button*/}
      {/*    ml={'auto'}*/}
      {/*    onClick={() => {*/}
      {/*      setDebugData(JSON.stringify(completedGames, null, 2));*/}
      {/*      open();*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    Open*/}
      {/*  </Button>*/}
      {/* </FlexRow>*/}
      {/* <DebugModal opened={opened} onClose={close} data={debugData} />*/}
      <Text mt={'auto'} size="xs" c="dimmed">
        Frontend v{packageJson.version}
      </Text>
    </FlexCol>
  );
};
