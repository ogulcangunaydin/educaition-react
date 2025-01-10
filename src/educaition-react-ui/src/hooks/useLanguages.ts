import { useMemo } from "react";
import { useAppSelector } from "./useAppSelector";
import { Language } from "@educaition-react/ui/interfaces";
import { ComboboxItem } from "@mantine/core";

export function useLanguages(): Language[] {
  const languages = useAppSelector((state) => state.LanguagesState.languages);
  return languages;
}

export function useSelectItemLanguages(): {
  languages: Language[];
  selectItemLangs: ComboboxItem[];
} {
  const languages = useLanguages();

  return useMemo(
    () => ({
      languages,
      selectItemLangs: languages.map((lang) => ({
        label: lang.name,
        value: lang.code,
      })),
    }),
    [languages],
  );
}
