import { Button, Group, useMantineTheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';

interface GameRulesToggleProps {
  onOpenRules: () => void;
}

export const GameRulesToggle: FunctionComponent<GameRulesToggleProps> = ({ onOpenRules }) => {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  return (
    <Group align="center" gap="md" style={{ marginTop: theme.spacing.xl }}>
      <Button onClick={onOpenRules} variant="light">
        {t('buttons.rules')}
      </Button>
    </Group>
  );
};
