import { Stack, Switch, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { useGame } from '@/hooks/useGame.tsx';

type RuleItemProps = {
  name: string;
  description: string;
  state: boolean;
  idx: number;
};

export const RuleItem: FunctionComponent<RuleItemProps> = ({ name, description, state, idx }) => {
  const { toggleRule } = useGame();
  return (
    <FlexRow fullWidth>
      <Stack gap={'xs'}>
        <Text>{name}</Text>
        <Text size={'sm'} c={'dimmed'}>
          {description}
        </Text>
      </Stack>
      <Switch ml={'auto'} checked={state} onChange={() => toggleRule(idx)} />
    </FlexRow>
  );
};
