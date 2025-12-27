import { Flex } from '@mantine/core';
import type { MantineSize, MantineSpacing, StyleProp } from '@mantine/core';
import type { CSSProperties, FunctionComponent, ReactNode } from 'react';

type FlexRowProps = {
  gap?: StyleProp<number | MantineSize | (string & {})>;
  justify?: StyleProp<CSSProperties['justifyContent']>;
  align?: StyleProp<CSSProperties['alignItems']>;
  wrap?: boolean;
  p?: StyleProp<MantineSpacing>;
  mr?: StyleProp<MantineSpacing>;
  ml?: StyleProp<MantineSpacing>;
  mt?: StyleProp<MantineSpacing>;
  mb?: StyleProp<MantineSpacing>;
  my?: StyleProp<MantineSpacing>;
  fullWidth?: boolean;
  children: ReactNode;
};

export const FlexRow: FunctionComponent<FlexRowProps> = ({ gap, justify, align, wrap, p, mr, ml, mt, mb, my, fullWidth, children }) => {
  return (
    <Flex
      gap={gap ?? 'md'}
      p={p ?? undefined}
      mr={mr ?? undefined}
      ml={ml ?? undefined}
      mt={mt ?? undefined}
      mb={mb ?? undefined}
      my={my ?? undefined}
      direction={'row'}
      justify={justify ?? 'center'}
      align={align ?? 'center'}
      wrap={wrap ? 'wrap' : 'nowrap'}
      {...(fullWidth ? { w: '100%' } : {})}
    >
      {children}
    </Flex>
  );
};
