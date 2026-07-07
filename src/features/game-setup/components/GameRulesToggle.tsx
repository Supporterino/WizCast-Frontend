import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';

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
