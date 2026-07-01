import { Badge, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';

interface PredictionsTotalsBarProps {
  predictionsLabel: string;
  actualsLabel: string;
  totalPredictions: number;
  totalActuals: number;
  roundDisplay: number;
}

export const PredictionsTotalsBar: FunctionComponent<PredictionsTotalsBarProps> = ({
  predictionsLabel,
  actualsLabel,
  totalPredictions,
  totalActuals,
  roundDisplay,
}) => (
  <FlexRow fullWidth>
    <Text>{predictionsLabel}</Text>
    <Badge variant="light" mr="md">
      {totalPredictions} / {roundDisplay}
    </Badge>
    <Text ml="md">{actualsLabel}</Text>
    <Badge variant="light">
      {totalActuals} / {roundDisplay}
    </Badge>
  </FlexRow>
);
