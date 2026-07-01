import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { RuleItem } from './RuleItem.tsx';
import type { FunctionComponent } from 'react';
import { FlexCol } from '@/shared/components/Layout/FlexCol.tsx';
import { useGame } from '@/shared/hooks/useGame.tsx';

type RuleModalProps = {
  opened: boolean;
  onClose: () => void;
};

export const RuleModal: FunctionComponent<RuleModalProps> = ({ opened, onClose }) => {
  const { rules } = useGame();
  const { t } = useTranslation();

  return (
    <Modal opened={opened} onClose={onClose} title={t('modal.rules')} centered>
      <FlexCol>
        {rules.map((rule, idx) => (
          <RuleItem key={idx} name={rule.name} description={rule.description} state={rule.active} idx={idx} />
        ))}
      </FlexCol>
    </Modal>
  );
};
