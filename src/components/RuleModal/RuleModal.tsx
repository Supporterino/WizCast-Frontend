import { Modal } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { useRules } from '@/hooks/useRule.tsx';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';
import { RuleItem } from '@/components/RuleModal/RuleItem.tsx';

type RuleModalProps = {
  opened: boolean;
  onClose: () => void;
};
export const RuleModal: FunctionComponent<RuleModalProps> = ({ opened, onClose }) => {
  const { rules } = useRules();
  return (
    <Modal opened={opened} onClose={onClose} title="Rules" centered>
      <FlexCol>
        {rules.map((rule, idx) => (
          <RuleItem name={rule.name} description={rule.description} state={rule.active} idx={idx} />
        ))}
      </FlexCol>
    </Modal>
  );
};
