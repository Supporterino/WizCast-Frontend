import { useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Rule } from '@/types/game.ts';
import { validateRoundSubmission } from '@/utils/scoring.ts';
import { ERROR_CODES } from '@/shared/constants.ts';

export function useRoundValidation() {
  const { t } = useTranslation();

  const showValidationError = useCallback(
    (errorCode: string | undefined) => {
      switch (errorCode) {
        case ERROR_CODES.INCOMPLETE_PREDICTIONS:
          notifications.show({
            title: t('notifications.roundIncomplete.title'),
            color: 'red',
            icon: <IconX />,
            autoClose: 5000,
            message: t('notifications.roundIncomplete.predictionMissing'),
          });
          break;
        case ERROR_CODES.INCOMPLETE_ACTUALS:
          notifications.show({
            title: t('notifications.roundIncomplete.title'),
            color: 'red',
            icon: <IconX />,
            autoClose: 5000,
            message: t('notifications.roundIncomplete.actualMissing'),
          });
          break;
        case ERROR_CODES.TOO_MANY_PREDICTIONS:
          notifications.show({
            title: t('notifications.roundIncorrect.title'),
            color: 'red',
            icon: <IconX />,
            autoClose: 5000,
            message: t('notifications.roundIncorrect.tooManyPredictions'),
          });
          break;
        case ERROR_CODES.NO_MATCHING_PREDICTION:
          notifications.show({
            title: t('notifications.roundIncorrect.title'),
            color: 'red',
            icon: <IconX />,
            autoClose: 5000,
            message: t('notifications.roundIncorrect.noMatchingPrediction'),
          });
          break;
        case ERROR_CODES.INVALID_ACTUALS_TOTAL:
          notifications.show({
            title: t('notifications.roundIncorrect.title'),
            color: 'red',
            icon: <IconX />,
            autoClose: 5000,
            message: t('notifications.roundIncorrect.actualMismatch'),
          });
          break;
      }
    },
    [t],
  );

  const validateRound = useCallback(
    (currentRound: number, predictions: Array<number | undefined>, actuals: Array<number | undefined>, rules: Array<Rule>) => {
      const result = validateRoundSubmission(currentRound, predictions, actuals, rules);
      if (!result.valid) {
        showValidationError(result.errorCode);
        return false;
      }
      return true;
    },
    [showValidationError],
  );

  return { validateRound, showValidationError };
}
