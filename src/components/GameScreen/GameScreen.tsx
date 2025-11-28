import { Alert, Box, Button, Grid, GridCol, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconX } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { PlayerCard } from '@/components/PlayerCard/PlayerCard.tsx';
import { Route as ResultRoute } from '@/routes/results/overview';
import { useGame } from '@/hooks/useGame.tsx';
import { useStore } from '@/hooks/useStore.tsx';

export const GameScreen: FunctionComponent = () => {
  const { rules, id, players, currentRound, rounds, setCurrentRound, roundCount, endGame, scores, startDate, location } = useGame();
  const navigate = useNavigate();
  const { setCompletedGames } = useStore();
  const { t } = useTranslation();

  const notifyRoundIncomplete = (msgKey: string) =>
    notifications.show({
      title: t('notifications.roundIncomplete.title'),
      color: 'red',
      icon: <IconX />,
      message: t(msgKey),
    });

  const notifyRoundIncorrect = (msgKey: string) =>
    notifications.show({
      title: t('notifications.roundIncorrect.title'),
      color: 'red',
      icon: <IconX />,
      message: t(msgKey),
    });

  const handleNextRound = () => {
    if (!rounds[currentRound].predictions.every((v) => v != undefined)) {
      notifyRoundIncomplete('notifications.roundIncomplete.predictionMissing');
    } else if (!rounds[currentRound].actuals.every((v) => v != undefined)) {
      notifyRoundIncomplete('notifications.roundIncomplete.actualMissing');
    } else if (!rounds[currentRound].predictions.every((v) => v <= currentRound + 1)) {
      notifyRoundIncorrect('notifications.roundIncorrect.tooManyPredictions');
    } else if (rounds[currentRound].predictions.reduce((acc, val) => acc + val, 0) === currentRound + 1 && rules[0].active) {
      notifyRoundIncorrect('notifications.roundIncorrect.noMatchingPrediction');
    } else if (rounds[currentRound].actuals.reduce((acc, val) => acc + val, 0) !== currentRound + 1) {
      notifyRoundIncorrect('notifications.roundIncorrect.actualMismatch');
    } else {
      setCurrentRound(currentRound + 1);
    }
  };

  const handleFinishGame = () => {
    const finishedGame = {
      id,
      startDate: startDate!,
      endDate: new Date(),
      location,
      players,
      rules,
      rounds,
      scores,
    };

    setCompletedGames((prev) => [...prev, finishedGame]);
    endGame();
    navigate({ to: ResultRoute.to });
  };

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <FlexRow fullWidth gap="md" mb="md">
        <Button mr="auto" variant="light" onClick={() => setCurrentRound(currentRound - 1)} disabled={currentRound === 0}>
          {t('buttons.previousRound')}
        </Button>

        <Text>
          {t('labels.currentRound', {
            current: currentRound + 1,
            total: roundCount,
          })}
        </Text>

        <Button ml="auto" variant="light" onClick={handleNextRound} disabled={currentRound + 1 === roundCount}>
          {t('buttons.nextRound')}
        </Button>

        {currentRound + 1 === roundCount && <Button onClick={handleFinishGame}>{t('buttons.endGame')}</Button>}
      </FlexRow>

      {/* Alert for rule “No matching prediction” */}
      {rules[0].active && rounds[currentRound].predictions.reduce((acc, val) => acc! + (val ?? 0), 0) === currentRound + 1 && (
        <Alert
          mb="md"
          variant="light"
          color="blue"
          radius="md"
          title={t('alerts.predictionMatches.title')}
          icon={<IconInfoCircle stroke={1.5} />}
        >
          {t('alerts.predictionMatches.message')}
        </Alert>
      )}
      <Grid>
        {players.map((name, idx) => (
          <GridCol span={6} key={idx}>
            <PlayerCard name={name} idx={idx} />
          </GridCol>
        ))}
      </Grid>
    </Box>
  );
};
