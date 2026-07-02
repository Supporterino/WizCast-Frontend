import { useEffect, useRef } from 'react';
import { useGameBroadcast } from './hooks/useGameBroadcast.ts';
import { useRoundValidation } from './hooks/useRoundValidation.tsx';
import { useGameLifecycle } from './hooks/useGameLifecycle.ts';
import { HostLobby } from './HostLobby.tsx';
import { ReconnectingBanner } from './components/ReconnectingBanner.tsx';
import { RoundNavigator } from './components/RoundNavigator.tsx';
import { ValidationBanner } from './components/ValidationBanner.tsx';
import { HostPlayingView } from './components/HostPlayingView.tsx';
import type { HostLobbyHandle } from './HostLobby.tsx';
import type { FunctionComponent } from 'react';
import type { RoundData } from '@/types/game.ts';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';
import { FlexCol } from '@/shared/components/Layout/FlexCol.tsx';
import { useConnection } from '@/shared/hooks/useConnection.ts';
import { useStore } from '@/shared/hooks/useStore.tsx';
import { useGame } from '@/shared/hooks/useGame.tsx';
import { useDebounce } from '@/shared/hooks/useDebounce.ts';

export const GameScreen: FunctionComponent = () => {
  const {
    id,
    rules,
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
    playerSlots,
    setPrediction,
    setActual,
    setScoreChange,
  } = useGame();
  const { setCompletedGames } = useStore();
  const conn = useConnection();

  const hostLobbyRef = useRef<HostLobbyHandle>(null);

  const shouldBroadcastRef = useRef(false);

  const { broadcastState, sessionActive } = useGameBroadcast(
    conn,
    players,
    rounds,
    scores,
    rules,
    currentRound,
  );

  const { validateRound } = useRoundValidation();

  const { handleNextRound, handleFinishGame } = useGameLifecycle({
    gameId: id,
    startDate,
    location,
    players,
    rules,
    rounds,
    scores,
    currentRound,
    setCurrentRound,
    setPlayingRound,
    setPrediction,
    setActual,
    setScoreChange,
    endGame,
    setCompletedGames,
    sessionActive,
    validateRoundFn: validateRound,
  });

  const debouncedBroadcast = useDebounce(() => {
    if (!sessionActive) return;
    broadcastState();
  }, 300);

  useEffect(() => {
    if (!sessionActive) return;
    if (!shouldBroadcastRef.current) {
      shouldBroadcastRef.current = true;
      return;
    }
    debouncedBroadcast();
  }, [rounds, currentRound, debouncedBroadcast, sessionActive]);

  const hostReconnecting = conn.connectionState.transport === 'CONNECTING' && conn.connectionState.session !== 'ACTIVE';

  const round = rounds[currentRound] as RoundData | undefined;

  return (
    <FlexCol fullWidth h="100%" justify="flex-start" mb="md">
      <ReconnectingBanner isReconnecting={hostReconnecting} />

      <FlexRow fullWidth gap="md">
        <RoundNavigator
          currentRound={currentRound}
          roundCount={roundCount}
          sessionActive={sessionActive}
          onPrevious={() => setCurrentRound(currentRound - 1)}
          onNext={handleNextRound}
          onFinish={handleFinishGame}
        />
        <HostLobby ref={hostLobbyRef} />
      </FlexRow>

      {round && <ValidationBanner rules={rules} currentRound={currentRound} round={round} />}

      <HostPlayingView
        players={players}
        rounds={rounds}
        scores={scores}
        currentRound={currentRound}
        sessionActive={sessionActive}
        playerSlots={playerSlots}
      />
    </FlexCol>
  );
};
