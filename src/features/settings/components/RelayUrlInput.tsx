import { Text, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

export const RelayUrlInput: FunctionComponent = () => {
  const { t } = useTranslation();
  const [relayUrl, setRelayUrl] = useState(() => localStorage.getItem('relayUrl') ?? 'ws://localhost:3000');

  useEffect(() => {
    localStorage.setItem('relayUrl', relayUrl);
  }, [relayUrl]);

  return (
    <FlexRow fullWidth>
      <Text>{t('settingsMenu.relayUrl', 'Relay URL')}</Text>
      <TextInput
        ml="auto"
        value={relayUrl}
        onChange={(e) => setRelayUrl(e.target.value)}
        placeholder="ws://localhost:3000"
        style={{ minWidth: 200, marginLeft: 12 }}
      />
    </FlexRow>
  );
};
