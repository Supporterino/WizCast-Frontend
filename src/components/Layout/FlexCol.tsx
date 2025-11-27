import { Flex } from '@mantine/core';
import type { MantineSize, MantineSpacing, StyleProp } from '@mantine/core';
import type { CSSProperties, FunctionComponent, ReactNode } from 'react';

type FlexColProps = {
  gap?: StyleProp<number | MantineSize | (string & {})>;
  justify?: StyleProp<CSSProperties['justifyContent']>;
  align?: StyleProp<CSSProperties['alignItems']>;
  wrap?: boolean;
  p?: StyleProp<MantineSpacing>;
  mr?: StyleProp<MantineSpacing>;
  ml?: StyleProp<MantineSpacing>;
  mt?: StyleProp<MantineSpacing>;
  mb?: StyleProp<MantineSpacing>;
  h?: StyleProp<CSSProperties['height']>;
  fullWidth?: boolean;
  children: ReactNode;
};

export const FlexCol: FunctionComponent<FlexColProps> = ({ gap, justify, align, wrap, p, mr, ml, mt, mb, h, fullWidth, children }) => {
  return (
    <Flex
      gap={gap ?? 'md'}
      p={p ?? undefined}
      direction={'column'}
      h={h ?? undefined}
      justify={justify ?? 'center'}
      align={align ?? 'center'}
      wrap={wrap ? 'wrap' : 'nowrap'}
      mr={mr ?? undefined}
      ml={ml ?? undefined}
      mt={mt ?? undefined}
      mb={mb ?? undefined}
      {...(fullWidth ? { w: '100%' } : {})}
    >
      {children}
    </Flex>
  );
};
