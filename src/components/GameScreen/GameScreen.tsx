import { ActionIcon, Alert, Badge, Box, Grid, GridCol, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconExclamationCircleFilled,
  IconInfoCircle,
  IconReportAnalytics,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { PlayerCard } from '@/components/PlayerCard/PlayerCard.tsx';
import { Route as ResultRoute } from '@/routes/results/overview';
import { useGame } from '@/hooks/useGame.tsx';
import { useStore } from '@/hooks/useStore.tsx';

export const GameScreen: FunctionComponent = () => {
  const {
    rules,
    id,
    players,
    currentRound,
    rounds,
    setCurrentRound,
    roundCount,
    endGame,
    scores,
    startDate,
    location,
    setPlayingRound,
    playingRound,
  } = useGame();
  const navigate = useNavigate();
  const { setCompletedGames } = useStore();
  const { t } = useTranslation();

  const notifyRoundIncomplete = (
    msgKey: 'notifications.roundIncomplete.predictionMissing' | 'notifications.roundIncomplete.actualMissing',
  ) =>
    notifications.show({
      title: t('notifications.roundIncomplete.title'),
      color: 'red',
      icon: <IconX />,
      autoClose: 5000,
      message: t(msgKey),
    });

  const notifyRoundIncorrect = (
    msgKey:
      | 'notifications.roundIncorrect.tooManyPredictions'
      | 'notifications.roundIncorrect.noMatchingPrediction'
      | 'notifications.roundIncorrect.actualMismatch',
  ) =>
    notifications.show({
      title: t('notifications.roundIncorrect.title'),
      color: 'red',
      icon: <IconX />,
      autoClose: 5000,
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
      if (playingRound == currentRound) setPlayingRound((prev) => prev + 1);
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
        <ActionIcon size="lg" mr="auto" variant="light" onClick={() => setCurrentRound(currentRound - 1)} disabled={currentRound === 0}>
          <IconArrowNarrowLeft stroke={1.5} />
        </ActionIcon>

        <Text>
          {t('labels.currentRound', {
            current: currentRound + 1,
            total: roundCount,
          })}
        </Text>

        <ActionIcon size="lg" ml="auto" variant="light" onClick={handleNextRound} disabled={currentRound + 1 === roundCount}>
          <IconArrowNarrowRight stroke={1.5} />
        </ActionIcon>

        {currentRound + 1 === roundCount && (
          <ActionIcon onClick={handleFinishGame}>
            <IconReportAnalytics stroke={1.5} />
          </ActionIcon>
        )}
      </FlexRow>
      <FlexRow fullWidth mt={'md'}>
        <Text>{t('gameScreen.predictions')}</Text>
        <Badge variant={'light'} mr={'md'}>
          {rounds[currentRound].predictions.reduce((acc, val) => acc! + (!isNaN(val!) ? val! : 0), 0)} / {currentRound + 1}
        </Badge>
        <Text ml={'md'}>{t('gameScreen.actuals')}</Text>
        <Badge variant={'light'}>
          {rounds[currentRound].actuals.reduce((acc, val) => acc! + (!isNaN(val!) ? val! : 0), 0)} / {currentRound + 1}
        </Badge>
      </FlexRow>
      {/* Alert for rule “No matching prediction” */}
      {rules[0].active &&
        rounds[currentRound].predictions.every((val) => val !== undefined) &&
        rounds[currentRound].predictions.reduce((acc, val) => acc + val, 0) === currentRound + 1 && (
          <Alert
            my="md"
            variant="light"
            color="blue"
            radius="md"
            title={t('alerts.predictionMatches.title')}
            icon={<IconInfoCircle stroke={1.5} />}
          >
            {t('alerts.predictionMatches.message')}
          </Alert>
        )}
      {!rounds[currentRound].predictions.every((v) => (isNaN(v!) ? true : (v ?? 0) <= currentRound + 1)) && (
        <Alert
          my={'xs'}
          variant="light"
          color="red"
          title={t('notifications.roundIncorrect.title')}
          icon={<IconExclamationCircleFilled stroke={1.5} />}
        >
          {t('notifications.roundIncorrect.tooManyPredictions')}
        </Alert>
      )}
      {rounds[currentRound].actuals.every((v) => v !== undefined) &&
        rounds[currentRound].actuals.reduce((acc, val) => acc + val, 0) !== currentRound + 1 && (
          <Alert
            my={'xs'}
            variant="light"
            color="red"
            title={t('notifications.roundIncorrect.title')}
            icon={<IconExclamationCircleFilled stroke={1.5} />}
          >
            {t('notifications.roundIncorrect.actualMismatch')}
          </Alert>
        )}
      <Grid mt={'md'}>
        {players.map((name, idx) => (
          <GridCol span={6} key={idx}>
            <PlayerCard name={name} idx={idx} />
          </GridCol>
        ))}
      </Grid>
    </Box>
  );
};
