import { BarChart, LineChart } from '@mantine/charts';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import type { CumulativeScoreEntry, RoundDiff } from '@/utils/gameDiff.ts';
import type { SeriesItem } from '@/utils/seriesGen.ts';
import type { PlayerAccuracy } from '@/utils/playerAccuracy.ts';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';

type CompletedGraphsProps = {
  roundDiff: Array<RoundDiff>;
  scoreDevelopment: Array<CumulativeScoreEntry>;
  playerSeries: Array<SeriesItem>;
  accuracy: PlayerAccuracy;
};

export const CompletedGraphs: FunctionComponent<CompletedGraphsProps> = ({ roundDiff, scoreDevelopment, playerSeries, accuracy }) => {
  const { t } = useTranslation();

  return (
    <FlexCol fullWidth>
      <Text fw={600}>{t('gameOverview.diffHeading')}</Text>
      <LineChart
        h={300}
        w={'100%'}
        data={roundDiff}
        dataKey="round"
        series={[{ name: 'diff', color: 'indigo.6' }]}
        curveType="monotone"
        tickLine="xy"
      />
      <Text fw={600}>{t('gameOverview.scoreDevelopment')}</Text>
      <LineChart h={300} data={scoreDevelopment} dataKey="round" series={playerSeries} curveType="monotone" tickLine="xy" />
      <Text fw={600}>{t('gameOverview.accuracyHeading')}</Text>
      <BarChart
        h={300}
        w={'100%'}
        data={[accuracy]}
        dataKey="idx"
        series={playerSeries}
        tickLine="y"
        withXAxis={false}
        withLegend
        yAxisProps={{ domain: [0, 100] }}
        valueFormatter={(value) => `${value}%`}
      />
    </FlexCol>
  );
};
