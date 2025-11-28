import { Burger, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

type HeaderProps = {
  opened: boolean;
  toggle: () => void;
};

export const Header: FunctionComponent<HeaderProps> = ({ toggle, opened }) => {
  return (
    <FlexRow fullWidth p="sm" gap="sm">
      <Burger opened={opened} onClick={toggle} size="sm" color={'red'} />
      <Text mr={'auto'} size={'lg'} fw={700} variant={'gradient'} gradient={{ from: 'red', to: 'orange', deg: 0 }}>
        WizCast
      </Text>
    </FlexRow>
  );
};
