import { ComboboxItem, ComboboxParsedItem } from "@mantine/core";

export interface FilterOptionsInput {
  options: ComboboxParsedItem[];
  search: string;
  limit: number;
}

export interface OptionsGroup {
  group: string;
  items: ComboboxItem[];
}

export interface FilterPickedTagsInput {
  data: ComboboxParsedItem[];
  value: string[];
}
