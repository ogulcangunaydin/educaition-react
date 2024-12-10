import {
  ComboboxParsedItem,
  ComboboxParsedItemGroup,
  isOptionsGroup,
} from "@mantine/core";
import { FilterPickedTagsInput } from "@educaition-react/ui/interfaces";

export function isValueChecked(
  value: string | string[] | undefined | null,
  optionValue: string,
) {
  return Array.isArray(value)
    ? value.includes(optionValue)
    : value === optionValue;
}

export function isEmptyComboboxData(data: ComboboxParsedItem[]) {
  if (data.length === 0) {
    return true;
  }

  for (const item of data) {
    if (!("group" in item)) {
      return false;
    }

    if ((item as ComboboxParsedItemGroup).items.length > 0) {
      return false;
    }
  }

  return true;
}

export function filterPickedValues({ data, value }: FilterPickedTagsInput) {
  const normalizedValue = value.map((item) => item.trim().toLowerCase());

  const filtered = data.reduce<ComboboxParsedItem[]>((acc, item) => {
    if (isOptionsGroup(item)) {
      acc.push({
        group: item.group,
        items: item.items.filter(
          (option) =>
            normalizedValue.indexOf(option.value.toLowerCase().trim()) === -1,
        ),
      });
    } else if (
      normalizedValue.indexOf(item.value.toLowerCase().trim()) === -1
    ) {
      acc.push(item);
    }

    return acc;
  }, []);

  return filtered;
}

export function filterDisabledValues(data: ComboboxParsedItem[]) {
  return data
    .flatMap((item) => {
      if (isOptionsGroup(item)) {
        return item.items.filter((childItem) => !childItem.disabled);
      }
      if (item.disabled) {
        return [];
      }
      return [item];
    })
    .map((item) => item.value);
}
