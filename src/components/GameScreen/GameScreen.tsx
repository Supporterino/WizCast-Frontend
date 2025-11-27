import { Alert, Box, Button, Grid, GridCol, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconX } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import type { FunctionComponent } from 'react';
import { useScoreboard } from '@/hooks/useScoreboard.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { PlayerCard } from '@/components/PlayerCard/PlayerCard.tsx';
import { useRules } from '@/hooks/useRule.tsx';
import { Route as ResultRoute } from '@/routes/game/result.tsx'

export const GameScreen: FunctionComponent = () => {
  const { players, currentRound, rounds, setCurrentRound, roundCount } = useScoreboard();
  const { rules } = useRules();
  const navigate = useNavigate();

  const handleNextRound = () => {
    if (!rounds[currentRound].predictions.every((value) => value != undefined)) {
      notifications.show({
        title: 'Round incomplete',
        color: 'red',
        icon: <IconX />,
        message: 'Not all players have valid prediction.',
      });
    } else if (!rounds[currentRound].actuals.every((value) => value != undefined)) {
      notifications.show({
        title: 'Round incomplete',
        color: 'red',
        icon: <IconX />,
        message: 'Not all players have valid actual.',
      });
    } else if (!rounds[currentRound].predictions.every((value) => value <= currentRound + 1)) {
      notifications.show({
        title: 'Round incorrect',
        color: 'red',
        icon: <IconX />,
        message: 'A player predicted more hits than available',
      });
    } else if (rounds[currentRound].predictions.reduce((acc, val) => acc + val, 0) == currentRound + 1 && rules[0].active) {
      notifications.show({
        title: 'Round incorrect',
        color: 'red',
        icon: <IconX />,
        message: 'The predictions match the actual cards. Rule: No matching prediction is active',
      });
    } else if (rounds[currentRound].actuals.reduce((acc, val) => acc + val, 0) != currentRound + 1) {
      notifications.show({
        title: 'Round incorrect',
        color: 'red',
        icon: <IconX />,
        message: 'The actual hits do not align with the given number of cards',
      });
    } else setCurrentRound(currentRound + 1);
  };
  return (
    <Box
      style={{
        position: 'relative',
        minHeight: '100%',
      }}
    >
      <FlexRow fullWidth gap={'md'} mb={'md'}>
        <Button mr={'auto'} variant={'light'} onClick={() => setCurrentRound(currentRound - 1)} disabled={currentRound == 0}>
          Previous Round
        </Button>
        <Text>
          Current Round: {currentRound + 1}/{roundCount}
        </Text>
        <Button ml={'auto'} variant={'light'} onClick={handleNextRound} disabled={currentRound + 1 == roundCount}>
          Next Round
        </Button>
        {currentRound + 1 == roundCount && <Button onClick={() => navigate({ to: '/game/result' })}>Results</Button>}
      </FlexRow>
      {rules[0].active && rounds[currentRound].predictions.reduce((acc, val) => acc! + val!, 0) == currentRound + 1 && (
        <Alert mb={'md'} variant="light" color="blue" radius="md" title="Prediction count matches" icon={<IconInfoCircle stroke={1.5} />}>
          Your current prediction matches the number of cards this round. This isn't allowed since rule (No matching prediction) is active.
        </Alert>
      )}
      <Grid>
        {players.map((name, idx) => (
          <GridCol span={6}>
            <PlayerCard name={name} idx={idx} />
          </GridCol>
        ))}
      </Grid>
        <Button onClick={() => navigate({ to: ResultRoute.to })}>Results</Button>
    </Box>
  );
};
