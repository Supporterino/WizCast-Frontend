import { Alert, Box, Button, Title } from '@mantine/core';
import { IconExclamationCircle, IconInfoCircle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useGameSetup } from './hooks/useGameSetup.ts';
import { PlayerCountSelector } from './components/PlayerCountSelector.tsx';
import { PlayerNameInputs } from './components/PlayerNameInputs.tsx';
import { GameRulesToggle } from './components/GameRulesToggle.tsx';
import type { FunctionComponent } from 'react';
import { RuleModal } from '@/features/game-setup/components/RuleModal/RuleModal.tsx';

export const GameSetupPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const { form, isValid, handlersRef, handleSubmit } = useGameSetup();

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <form onSubmit={handleSubmit}>
        <Title c="red" mb="lg">
          {t('titles.new')}
        </Title>

        <PlayerCountSelector
          playerCount={form.values.playerCount}
          handlersRef={handlersRef}
          onChange={(value) => form.setFieldValue('playerCount', value)}
        />

        <PlayerNameInputs form={form} />

        {form.getValues().playerCount == 2 && (
          <Alert variant="light" color="blue" radius="md" title={t('alerts.playerCount.title')} icon={<IconInfoCircle stroke={1.5} />}>
            {t('alerts.playerCount.message')}
          </Alert>
        )}

        {!isValid && (
          <Alert variant="light" color="red" radius="md" title={t('alerts.invalidForm')} icon={<IconExclamationCircle stroke={1.5} />}>
            {t('errors.duplicate')}
          </Alert>
        )}

        <GameRulesToggle onOpenRules={open} />
        <Button ml="auto" variant="filled" type="submit" disabled={!isValid}>
          {t('buttons.play')}
        </Button>
      </form>

      <RuleModal opened={opened} onClose={close} />
    </Box>
  );
};
