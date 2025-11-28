import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';
import { RuleItem } from '@/components/RuleModal/RuleItem.tsx';
import { useGame } from '@/hooks/useGame.tsx';

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
