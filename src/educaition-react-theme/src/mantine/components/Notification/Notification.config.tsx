import { faCheck, faExclamation, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MantineColor, Notification } from '@mantine/core';
// import { Bounce, Rotate } from 'react-awesome-reveal';
import classes from './Notification.module.scss';

export type NotificationType = 'additional' | 'error' | 'info' | 'success' | 'warning';

const NotificationIcons: Record<NotificationType, JSX.Element> = {
  additional: <FontAwesomeIcon icon={faCheck} />,
  error: <FontAwesomeIcon icon={faTimes} />,
  info: <FontAwesomeIcon icon={faExclamation} flip="vertical" />,
  success: <FontAwesomeIcon icon={faCheck} />,
  warning: <FontAwesomeIcon icon={faExclamation} />,
};

export const NOTIFICATION_CONTAINER_MAX_WIDTH = 580;

const NotificationColorsConfig: Record<
  NotificationType,
  {
    color: MantineColor;
    iconBackgroundColorShade: number;
    iconColorShade?: number;
  }
> = {
  additional: {
    color: 'blue',
    iconBackgroundColorShade: 1,
    iconColorShade: 9,
  },
  error: {
    color: 'red',
    iconBackgroundColorShade: 4,
  },
  info: {
    color: 'teal',
    iconBackgroundColorShade: 5,
  },
  success: {
    color: 'green',
    iconBackgroundColorShade: 5,
  },
  warning: {
    color: 'yellow',
    iconBackgroundColorShade: 6,
  },
};

const NotificationColorToTypeMapping: Partial<Record<MantineColor, NotificationType>> = {
  blue: 'additional',
  green: 'success',
  red: 'error',
  teal: 'info',
  yellow: 'warning',
};

const NotificationTypeToColorMapping: Record<NotificationType, MantineColor> = Object.entries(
  NotificationColorToTypeMapping,
).reduce((acc, [key, value]) => {
  if (value) {
    acc[value] = key as MantineColor;
  }
  return acc;
}, {} as Record<NotificationType, MantineColor>);

export function getNotificationTypeFromColor(color: MantineColor): NotificationType {
  return NotificationColorToTypeMapping[color] || 'info';
}

export function getNotificationColorFromType(type: NotificationType): MantineColor {
  return NotificationTypeToColorMapping[type];
}

export function getNotificationIconFromType(type: NotificationType): JSX.Element {
  return NotificationIcons[type];
}

export const NotificationConfig = Notification.extend({
  classNames: {
    body: classes.body,
    closeButton: classes.closeButton,
    description: classes.description,
    icon: classes.icon,
    root: classes.root,
    title: classes.title,
  },
  styles: (theme, { color: colorParam }) => {
    const type = getNotificationTypeFromColor(colorParam as MantineColor);

    if (!type) {
      return {};
    }

    const { color, iconBackgroundColorShade } = NotificationColorsConfig[type];

    return {
      root: {
        borderColor: theme.colors[color][iconBackgroundColorShade],
        boxShadow: `0 4px 8px ${theme.colors[color][iconBackgroundColorShade]}`,
      },
      icon: {
        backgroundColor: theme.colors[color][iconBackgroundColorShade],
      },
      title: {
        color: theme.colors[color][iconBackgroundColorShade],
      },
      description: {
        color: theme.colors[color][iconBackgroundColorShade],
      },
      closeButton: {
        color: theme.colors[color][iconBackgroundColorShade],
        '&:hover': {
          color: theme.colors[color][iconBackgroundColorShade + 2],
        },
      },
    };
  },
});

// // Example usage of the Notification component with animations
// export function AnimatedNotification({ type, message, title }) {
//   const color = getNotificationColorFromType(type);

//   return (
//     <Bounce>
//       <NotificationConfig color={color} title={title}>
//         <Rotate>{getNotificationIconFromType(type)}</Rotate>
//         {message}
//       </NotificationConfig>
//     </Bounce>
//   );
// }