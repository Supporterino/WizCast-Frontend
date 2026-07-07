import { Badge, Grid, GridCol, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';

interface AccuracyBadgeGridProps {
  players: Array<string>;
  accuracyData: Record<string, number | string>;
}

export const AccuracyBadgeGrid: FunctionComponent<AccuracyBadgeGridProps> = ({ players, accuracyData }) => (
  <Grid mt="auto" w="100%" grow>
    {players.map((name, idx) => {
      const val = accuracyData[name];
      const pct = typeof val === 'number' ? val : 0;
      return (
        <GridCol span={3} key={idx}>
          <FlexRow align="center">
            <Text>{name}</Text>
            <Badge variant="light" ml={8}>
              {pct.toFixed(0)}%
            </Badge>
          </FlexRow>
        </GridCol>
      );
    })}
  </Grid>
);
