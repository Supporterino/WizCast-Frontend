import { Burger, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';

type HeaderProps = {
  opened: boolean;
  toggle: () => void;
};

export const Header: FunctionComponent<HeaderProps> = ({ toggle, opened }) => {
  return (
    <FlexRow
      fullWidth
      gap="sm"
      style={{
        paddingTop: 'calc(var(--mantine-spacing-sm) + env(safe-area-inset-top, 0px))',
        paddingRight: 'calc(var(--mantine-spacing-sm) + env(safe-area-inset-right, 0px))',
        paddingBottom: 'var(--mantine-spacing-sm)',
        paddingLeft: 'calc(var(--mantine-spacing-sm) + env(safe-area-inset-left, 0px))',
      }}
    >
      <Burger opened={opened} onClick={toggle} size="sm" color={'red'} />
      <Text mr={'auto'} size={'lg'} fw={700} variant={'gradient'} gradient={{ from: 'red', to: 'orange', deg: 0 }}>
        WizCast
      </Text>
    </FlexRow>
  );
};
