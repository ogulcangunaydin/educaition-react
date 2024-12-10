import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Group, Text, UnstyledButton } from "@mantine/core";
import { If } from "@educaition-react/ui/components";
import { useFlexIconRender } from "@educaition-react/ui/hooks";
import { NavigationLink } from "@educaition-react/ui/interfaces";
import React from "react";
import { NavLink } from "react-router-dom";
import classes from "./LayoutNavigationLinkGroupItem.module.scss";

interface LayoutNavigationLinkGroupItemProps {
  active: boolean;
  item: NavigationLink;
  onClick: VoidFunction;
  onMouseEnter: (group: NavigationLink) => void;
  onMouseLeave: VoidFunction;
}

export function LayoutNavigationLinkGroupItem({
  active,
  item,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: LayoutNavigationLinkGroupItemProps) {
  const iconComponent = useFlexIconRender(item.icon, {
    fontSize: 15,
  });

  const handleOnClick = () => {
    if (item.onClick) {
      item.onClick();
    }
    onClick();
  };

  const content = (
    <>
      <Group gap={10}>
        {iconComponent}
        <Text component="span" fz={12} fw={500}>
          {item.label}
        </Text>
      </Group>

      <If value={(item.items?.length ?? 0) > 0}>
        <FontAwesomeIcon icon={faAngleRight} fontSize={12} />
      </If>
    </>
  );

  return (
    <>
      <If value={!!item.href}>
        <UnstyledButton
          className={classes.layoutNavigationLinkGroupItem}
          component={NavLink as React.FC<any>}
          to={item.href}
          data-active={active}
          onMouseEnter={() => onMouseEnter(item)}
          onClick={onClick}
        >
          {content}
        </UnstyledButton>
      </If>
      <If value={!item.href}>
        <div
          className={classes.layoutNavigationLinkGroupItem}
          data-active={active}
          style={item.onClick && { cursor: "pointer" }}
          onMouseEnter={() => onMouseEnter(item)}
          onMouseLeave={onMouseLeave}
          onClick={() => handleOnClick()}
        >
          {content}
        </div>
      </If>
    </>
  );
}
