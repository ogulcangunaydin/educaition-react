import { Button } from '@mantine/core';
import classes from './Button.module.scss';

export const ButtonConfig = Button.extend({
  classNames: {
    root: classes.root,
  },
  defaultProps: {
    size: 'md',
  },
});
