import { createFileRoute } from '@tanstack/react-router';
import { IconChartLine, IconList } from '@tabler/icons-react';
import { Tabs } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CompletedScoreboard } from '@/components/CompletedScoreboard/CompletedScoreboard.tsx';
import { useStore } from '@/hooks/useStore.tsx';
import { CompletedGraphs } from '@/components/CompletedGraphs/CompletedGraphs.tsx';
import { buildCumulativeScores, calculateRoundDiffs } from '@/utils/gameDiff.ts';
import { buildMantineSeries } from '@/utils/seriesGen.ts';
import { calculatePlayerAccuracy } from '@/utils/playerAccuracy.ts';

function RouteComponent() {
  const { resultID } = Route.useParams();
  const { getGameById } = useStore();
  const { t } = useTranslation();

  const game = getGameById(resultID);

  if (!game) {
    return <div>❌ Game not found.</div>;
  }

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

      <Tabs.Panel value="scoreboard" p={'xs'}>
        <CompletedScoreboard players={game.players} rounds={game.rounds} scores={game.scores} />
      </Tabs.Panel>

      <Tabs.Panel value="charts" p={'xs'}>
        <CompletedGraphs
          roundDiff={calculateRoundDiffs(game)}
          playerSeries={buildMantineSeries(game)}
          scoreDevelopment={buildCumulativeScores(game)}
          accuracy={calculatePlayerAccuracy(game)}
        />
      </Tabs.Panel>
    </Tabs>
  );
}

export const Route = createFileRoute('/results/$resultID')({
  component: RouteComponent,
});
