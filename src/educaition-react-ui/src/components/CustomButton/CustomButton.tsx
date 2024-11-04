import React from 'react';
import { Button, ButtonProps } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import classes from './Button.module.scss';

interface CustomButtonProps extends ButtonProps {
  onClick?: VoidFunction;
  type?: 'save' | 'cancel' | 'delete';
  icon?: React.ReactNode;
}

export function CustomButton({ onClick, type, icon, children, className, ...props }: CustomButtonProps) {
  const buttonTypeClass = type ? classes[type] : '';

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'save':
        return <FontAwesomeIcon icon={faSave} />;
      case 'cancel':
        return <FontAwesomeIcon icon={faTimes} />;
      case 'delete':
        return <FontAwesomeIcon icon={faTrash} />;
      default:
        return null;
    }
  };

  return (
    <Button className={clsx(classes.root, buttonTypeClass, className)} {...props}>
      {getIcon()}
      {children}
    </Button>
  );
}
