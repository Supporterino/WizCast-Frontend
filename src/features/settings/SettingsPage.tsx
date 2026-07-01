import { Divider, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { RelayUrlInput } from './components/RelayUrlInput.tsx';
import { ClearDataButton } from './components/ClearDataButton.tsx';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';
import { FlexCol } from '@/shared/components/Layout/FlexCol.tsx';

export const SettingsPage: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <FlexCol fullWidth h="100%">
      <Divider my="xs" label={t('settingsMenu.general')} labelPosition="left" w="100%" />
      <FlexRow fullWidth align="center">
        <Text>{t('settingsMenu.label')}</Text>
        <ThemeToggle />
      </FlexRow>
      <LanguageSelector />
      <Divider my="xs" label={t('settingsMenu.developer')} labelPosition="left" w="100%" />
      <RelayUrlInput />
      <ClearDataButton />
    </FlexCol>
  );
};
