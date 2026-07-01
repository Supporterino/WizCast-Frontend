import { Badge, Card, Grid, GridCol, NumberInput, Text } from '@mantine/core';
import { IconCardsFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import type { RoundData, SlotStatus  } from '@/types/game.ts';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';
import { getScoreTillRound } from '@/utils/scoring.ts';

interface PlayerCardProps {
  name: string;
  idx: number;
  prediction?: number;
  actual?: number;
  score?: number;
  scoreChange?: number;
  currentRound: number;
  playingRound: number;
  playerCount: number;
  rounds: Array<RoundData>;
  onPredictionChange?: (value: number) => void;
  onActualChange?: (value: number) => void;
  isRemoteConnected?: boolean;
  slotStatus?: SlotStatus;
  inputsDisabled?: boolean;
}

export const PlayerCard: FunctionComponent<PlayerCardProps> = ({
  name,
  idx,
  prediction,
  actual,
  score = 0,
  scoreChange,
  currentRound,
  playingRound,
  playerCount,
  rounds,
  onPredictionChange,
  onActualChange,
  isRemoteConnected,
  slotStatus,
  inputsDisabled,
}) => {
  const { t } = useTranslation();

  const isPredictionEmpty = prediction === undefined;
  const isActualEmpty = actual === undefined;

  const badgeLabel =
    slotStatus === 'disconnected' ? t('playerCard.disconnected', 'Disconnected') : t('playerCard.remote', 'Remote');
  const badgeColor = slotStatus === 'disconnected' ? 'orange' : 'green';

  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      bg={isRemoteConnected ? 'var(--mantine-color-green-light-hover)' : undefined}
    >
      <Card.Section withBorder inheritPadding>
        <FlexRow fullWidth p={'xs'}>
          <Text mr={'auto'} fw={500}>
            {name}
          </Text>
          {isRemoteConnected && (
            <Badge color={badgeColor} variant="light" size="xs" mr="xs">
              {badgeLabel}
            </Badge>
          )}
          {idx == currentRound % playerCount && <IconCardsFilled color={'red'} stroke={1.5} />}
        </FlexRow>
      </Card.Section>

      <Grid gap="xs" mt="sm">
        <GridCol m={'auto'} span={6}>
          <Text size="xl">{currentRound === playingRound ? score : getScoreTillRound(rounds, currentRound + 1, playerCount)[idx]}</Text>
          <Text c="dimmed" size="sm">
            {scoreChange}
          </Text>
        </GridCol>

        <GridCol span={6}>
          <NumberInput
            key={`prediction-${currentRound}-${idx}`}
            min={0}
            max={currentRound + 1}
            clampBehavior="strict"
            allowDecimal={false}
            allowNegative={false}
            label={t('playerCard.prediction')}
            value={prediction ?? undefined}
            onChange={(value) => {
              const newVal = typeof value === 'string' ? parseInt(value, 10) : value;
              if (onPredictionChange) onPredictionChange(newVal);
            }}
            hideControls
            disabled={inputsDisabled}
            error={isPredictionEmpty}
          />

          <NumberInput
            key={`actual-${currentRound}-${idx}`}
            min={0}
            max={currentRound + 1}
            clampBehavior="strict"
            allowDecimal={false}
            allowNegative={false}
            label={t('playerCard.actual')}
            value={actual ?? undefined}
            onChange={(value) => {
              const newVal = typeof value === 'string' ? parseInt(value, 10) : value;
              if (onActualChange) onActualChange(newVal);
            }}
            hideControls
            disabled={inputsDisabled}
            error={isActualEmpty}
          />
        </GridCol>
      </Grid>
    </Card>
  );
};
