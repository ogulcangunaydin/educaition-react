import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMantineTheme } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { t } from 'i18next';
import { InfoPanel } from '../';
import { ModalFooter } from '../';

export function openCancelModal(props: ModalCancelProps) {
  modals.openContextModal({
    modal: 'cancel',
    title: t('information'),
    innerProps: props,
  });
}

interface ModalCancelProps {
  onConfirm: VoidFunction;
}

export function ModalCancel({ context, id, innerProps }: ContextModalProps<ModalCancelProps>) {
  const theme = useMantineTheme();

  const handleCancel = () => {
    context.closeContextModal(id);
  };

  const handleConfirm = () => {
    handleCancel();
    innerProps.onConfirm();
  };

  return (
    <div>
      <InfoPanel
        content={t('cancelModalText')}
        icon={<FontAwesomeIcon color={theme.colors.gray[0]} icon={faTrashCan} size="4x" />}
      />

      <ModalFooter
        onSave={handleConfirm}
        onCancel={handleCancel}
        cancelBtnLabel={t('goBack')}
        cancelBtnProps={{
          variant: 'outline',
        }}
        saveBtnLabel={t('cancel')}
        saveBtnProps={{
          color: 'red',
        }}
      />
    </div>
  );
}
