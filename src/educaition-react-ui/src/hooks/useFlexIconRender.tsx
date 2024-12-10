import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import React, { useMemo } from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type IconType = IconDefinition | React.ReactNode | React.FC<any>;

export function useFlexIconRender(
  icon: IconType,
  props?: Partial<React.HTMLAttributes<HTMLDivElement> & FontAwesomeIconProps>,
): React.ReactNode {
  const isIconComponent = useMemo(() => React.isValidElement(icon), [icon]);
  const isFunctionalComponent = useMemo(
    () => typeof icon === "function",
    [icon],
  );

  if (!icon) {
    return null;
  }

  if (isIconComponent) {
    return icon as React.ReactNode;
  }

  if (isFunctionalComponent) {
    const IconComponent = icon as React.FC;
    return <IconComponent {...props} />;
  }

  return <FontAwesomeIcon icon={icon as IconProp} {...props} />;
}
