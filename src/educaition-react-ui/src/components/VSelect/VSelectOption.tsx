import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Combobox,
  ComboboxItem,
  Group,
  ThemeIcon,
  isOptionsGroup,
} from "@mantine/core";
import { OptionsGroup } from "@educaition-react/ui/interfaces";
import clsx from "clsx";
import React from "react";
import classes from "./VSelect.module.scss";
import { isValueChecked } from "./VSelect.utils";
import { VSelectDefaultItem } from "./VSelectDefaultItem";

interface VSelectOptionProps {
  checkIconPosition?: "left" | "right";
  data: ComboboxItem | OptionsGroup;
  itemComponent?: React.FC<any>;
  unstyled?: boolean;
  value?: string | string[] | null;
  withCheckIcon?: boolean;
}

export function VSelectOption({
  checkIconPosition,
  data,
  itemComponent: ItemComponent = VSelectDefaultItem,
  unstyled,
  value,
  withCheckIcon,
}: VSelectOptionProps) {
  if (!isOptionsGroup(data)) {
    const getCheckIcon = () => {
      if (!withCheckIcon) {
        return null;
      }

      if (!isValueChecked(value, data.value)) {
        return null;
      }

      return (
        <ThemeIcon variant="transparent" size={20} color="dark">
          <FontAwesomeIcon icon={faCheck} />
        </ThemeIcon>
      );
    };

    return (
      <Combobox.Option
        value={data.value}
        disabled={data.disabled}
        data-reverse={checkIconPosition === "right" || undefined}
        data-checked={isValueChecked(value, data.value) || undefined}
        className={clsx({ [classes.optionsDropdownOption]: !unstyled })}
      >
        <Group
          justify={
            checkIconPosition === "right" ? "space-between" : "flex-start"
          }
          gap={5}
          wrap="nowrap"
          w="100%"
          c="dark"
        >
          {checkIconPosition === "left" && getCheckIcon()}
          <ItemComponent {...data} />
          {checkIconPosition === "right" && getCheckIcon()}
        </Group>
      </Combobox.Option>
    );
  }

  const options = data.items.map((item) => (
    <VSelectOption
      checkIconPosition={checkIconPosition}
      data={item}
      itemComponent={ItemComponent}
      key={item.value}
      value={value}
      withCheckIcon={withCheckIcon}
    />
  ));

  return (
    <Combobox.Group
      label={data.group}
      classNames={{
        groupLabel: classes.optionGroupLabel,
      }}
    >
      {options}
    </Combobox.Group>
  );
}
