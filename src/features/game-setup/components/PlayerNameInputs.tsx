import { Box, TextInput, useMantineTheme } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

interface PlayerNameInputsProps {
  form: UseFormReturnType<any>;
}

export const PlayerNameInputs: FunctionComponent<PlayerNameInputsProps> = ({ form }) => {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  return (
    <Box style={{ marginTop: theme.spacing.lg }}>
      {form.getValues().players.map((_: string, index: number) => (
        <Box
          key={form.key(`players.${index}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
          }}
        >
          <TextInput
            placeholder={t('placeholder.playerName', { index: index + 1 })}
            {...form.getInputProps(`players.${index}`)}
            key={form.key(`players.${index}`)}
            style={{ flex: 1 }}
            required
            maxLength={12}
          />
        </Box>
      ))}
    </Box>
  );
};
