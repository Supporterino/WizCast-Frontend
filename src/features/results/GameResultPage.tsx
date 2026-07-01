import { IconChartLine, IconList } from '@tabler/icons-react';
import { Tabs } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ScoreboardTable } from './components/ScoreboardTable.tsx';
import { ChartsPanel } from './components/ChartsPanel.tsx';
import type { FunctionComponent } from 'react';
import type { StoredGame } from '@/types/game.ts';
import { buildCumulativeScores, calculateRoundDiffs } from '@/utils/gameDiff.ts';
import { buildMantineSeries } from '@/utils/seriesGen.ts';
import { calculatePlayerAccuracy } from '@/utils/playerAccuracy.ts';

interface GameResultPageProps {
  game: StoredGame;
}

export const GameResultPage: FunctionComponent<GameResultPageProps> = ({ game }) => {
  const { t } = useTranslation();

  return (
    <Tabs color="red" variant="outline" defaultValue="scoreboard">
      <Tabs.List>
        <Tabs.Tab value="scoreboard" leftSection={<IconList size={12} />}>
          {t('gameOverview.scoreboard')}
        </Tabs.Tab>
        <Tabs.Tab value="charts" leftSection={<IconChartLine size={12} />}>
          {t('gameOverview.charts')}
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="scoreboard" p="xs">
        <ScoreboardTable players={game.players} rounds={game.rounds} scores={game.scores} />
      </Tabs.Panel>
      <Tabs.Panel value="charts" p="xs">
        <ChartsPanel
          roundDiff={calculateRoundDiffs(game)}
          playerSeries={buildMantineSeries(game)}
          scoreDevelopment={buildCumulativeScores(game)}
          accuracy={calculatePlayerAccuracy(game)}
        />
      </Tabs.Panel>
    </Tabs>
  );
};
