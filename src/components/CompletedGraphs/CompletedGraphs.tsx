import { BarChart, LineChart } from '@mantine/charts';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import type { CumulativeScoreEntry, RoundDiff } from '@/utils/gameDiff.ts';
import type { SeriesItem } from '@/utils/seriesGen.ts';
import type { PlayerAccuracy } from '@/utils/playerAccuracy.ts';
import { getLargestDiff } from '@/utils/gameDiff.ts';
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
        series={[{ name: 'diff' }]}
        curveType="monotone"
        xAxisLabel={t('gameOverview.xAxis')}
        yAxisLabel={t('gameOverview.diff')}
        withTooltip={false}
        withPointLabels
        type="gradient"
        gradientStops={[
          { offset: 0, color: 'red.6' },
          { offset: 20, color: 'orange.6' },
          { offset: 40, color: 'yellow.5' },
          { offset: 50, color: 'lime.5' },
          { offset: 60, color: 'yellow.5' },
          { offset: 80, color: 'orange.6' },
          { offset: 100, color: 'red.6' },
        ]}
        yAxisProps={{ domain: [getLargestDiff(roundDiff) * -1, getLargestDiff(roundDiff)] }}
        tickLine="xy"
      />
      <Text fw={600}>{t('gameOverview.scoreDevelopment')}</Text>
      <LineChart
        h={300}
        data={scoreDevelopment}
        dataKey="round"
        series={playerSeries}
        withPointLabels
        xAxisLabel={t('gameOverview.xAxis')}
        yAxisLabel={t('gameOverview.points')}
        withTooltip={false}
        curveType="monotone"
        withLegend
        tickLine="xy"
      />
      <Text fw={600}>{t('gameOverview.accuracyHeading')}</Text>
      <BarChart
        h={300}
        w={'100%'}
        data={[accuracy]}
        dataKey="idx"
        series={playerSeries}
        tickLine="y"
        withXAxis={false}
        withTooltip={false}
        withBarValueLabel
        withLegend
        yAxisProps={{ domain: [0, 100] }}
        valueFormatter={(value) => `${value}%`}
      />
    </FlexCol>
  );
};
