import { Button, Group, NumberInput, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent, RefObject } from 'react';
import type { NumberInputHandlers } from '@mantine/core';

interface PlayerCountSelectorProps {
  playerCount: number;
  handlersRef: RefObject<NumberInputHandlers | null>;
  onChange: (value: number) => void;
}

export const PlayerCountSelector: FunctionComponent<PlayerCountSelectorProps> = ({ playerCount, handlersRef, onChange }) => {
  const { t } = useTranslation();

  return (
    <Group gap="xs">
      <Text mr="auto">{t('labels.numberOfPlayers')}</Text>
      <Button variant="light" onClick={() => handlersRef.current?.decrement()} disabled={playerCount <= 2}>
        –
      </Button>
      <NumberInput
        value={playerCount}
        min={2}
        max={6}
        allowDecimal={false}
        allowNegative={false}
        handlersRef={handlersRef}
        onChange={(value) => onChange(+value)}
        style={{ width: 40 }}
        hideControls
      />
      <Button variant="light" onClick={() => handlersRef.current?.increment()} disabled={playerCount >= 6}>
        +
      </Button>
    </Group>
  );
};
