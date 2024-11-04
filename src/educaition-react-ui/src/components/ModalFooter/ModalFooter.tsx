import { Box, ButtonProps, Group } from '@mantine/core';
import { If } from '../';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CustomButton } from '../CustomButton';
import classes from './ModalFooter.module.scss';

type ModalFooterProps = Partial<{
  cancelBtnLabel: string;
  cancelBtnProps: Omit<ButtonProps, 'data-testid'>;
  cancelBtnVisible: boolean;
  onCancel: VoidFunction;
  onSave: VoidFunction;
  saveBtnLabel: string;
  saveBtnProps: Omit<ButtonProps, 'data-testid'>;
}>;

export function ModalFooter({
  children,
  cancelBtnLabel,
  cancelBtnProps,
  cancelBtnVisible = true,
  onCancel,
  onSave,
  saveBtnLabel,
  saveBtnProps,
}: React.PropsWithChildren<ModalFooterProps>) {
  const { t } = useTranslation();
  const { className: cancelBtnClassName, ...otherCancelBtnProps } = cancelBtnProps ?? ({} as ButtonProps);

  return (
    <Box className={classes.modalFooter}>
      {children || (
        <Group justify="flex-end" gap={10}>
          <If value={cancelBtnVisible || !!(onCancel || cancelBtnProps)}>
            <CustomButton
              className={clsx(classes.cancelBtn, cancelBtnClassName)}
              data-testid="button-modal-footer-cancel"
              onClick={onCancel}
              variant="outline"
              type="cancel"
              miw={102}
              {...otherCancelBtnProps}
            >
              {cancelBtnLabel || t('cancel')}
            </CustomButton>
          </If>
          <CustomButton
            className={classes.saveBtn}
            data-testid="button-modal-footer-save"
            onClick={onSave}
            type="save"
            miw={84}
            {...saveBtnProps}
          >
            {saveBtnLabel || t('save')}
          </CustomButton>
        </Group>
      )}
    </Box>
  );
}
