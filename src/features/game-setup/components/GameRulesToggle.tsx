import { Button } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

interface GameRulesToggleProps {
  onOpenRules: () => void;
}

export const GameRulesToggle: FunctionComponent<GameRulesToggleProps> = ({ onOpenRules }) => {
  const { t } = useTranslation();

  return (
    <Button onClick={onOpenRules} variant="light">
      {t('buttons.rules')}
    </Button>
  );
};
