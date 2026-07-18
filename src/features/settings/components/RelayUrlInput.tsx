import { Text, TextInput } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnection } from '@/contexts/ConnectionProvider.tsx';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';
import { DEFAULT_RELAY_URL } from '@/shared/constants.ts';

export const RelayUrlInput: FunctionComponent = () => {
  const { t } = useTranslation();
  const { relayUrl, setRelayUrl } = useConnection();

  return (
    <FlexRow fullWidth>
      <Text>{t('settingsMenu.relayUrl', 'Relay URL')}</Text>
      <TextInput
        ml="auto"
        value={relayUrl}
        onChange={(e) => setRelayUrl(e.target.value)}
        placeholder={DEFAULT_RELAY_URL}
        style={{ minWidth: 200, marginLeft: 12 }}
      />
    </FlexRow>
  );
};
