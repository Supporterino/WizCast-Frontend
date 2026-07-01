import { Select, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

export const LanguageSelector: FunctionComponent = () => {
  const { t, i18n } = useTranslation();

  return (
    <FlexRow fullWidth>
      <Text>{t('settingsMenu.labelLanguage')}</Text>
      <Select
        ml="auto"
        value={i18n.language}
        onChange={(value) => i18n.changeLanguage(value!)}
        data={[
          { value: 'en', label: 'English' },
          { value: 'de', label: 'Deutsch' },
        ]}
        style={{ minWidth: 120, marginLeft: 12 }}
      />
    </FlexRow>
  );
};
