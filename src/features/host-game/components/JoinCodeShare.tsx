import { Button, CopyButton, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';

interface JoinCodeShareProps {
  joinCode: string | null;
}

export const JoinCodeShare: FunctionComponent<JoinCodeShareProps> = ({ joinCode }) => {
  const { t } = useTranslation();

  if (!joinCode) return null;

  return (
    <>
      <Text fw={500}>{t('multiplayer.joinCode', 'Join Code')}</Text>
      <CopyButton value={joinCode}>
        {({ copied, copy }) => (
          <Button fullWidth variant={copied ? 'filled' : 'outline'} color={copied ? 'green' : undefined} onClick={copy} size="lg">
            {copied ? t('multiplayer.copied', 'Copied!') : joinCode}
          </Button>
        )}
      </CopyButton>
      <Text size="xs" c="dimmed">
        {t('multiplayer.shareInstructions', 'Share this code with other players so they can join')}
      </Text>
    </>
  );
};
