/* eslint-disable @typescript-eslint/no-unused-vars */
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  BoxProps,
  CloseButtonProps,
  Combobox,
  ComboboxItem,
  ComboboxLikeProps,
  ElementProps,
  Input,
  InputBase,
  OptionsData,
  SelectFactory,
  StylesApiProps,
  __BaseInputProps,
  getOptionsLockup,
  getParsedComboboxData,
  isOptionsGroup,
  useCombobox,
  useMantineTheme,
  useProps,
  useResolvedStylesApi,
} from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { CustomIconSort } from "@educaition-react/ui/icons";
import clsx from "clsx";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import classes from "./VSelect.module.scss";
import { VSelectDefaultItem } from "./VSelectDefaultItem";
import { VSelectOptionsDropdown } from "./VSelectOptionsDropdown";

export interface VSelectProps
  extends __BaseInputProps,
    BoxProps,
    ComboboxLikeProps,
    StylesApiProps<SelectFactory>,
    ElementProps<"input", "onChange" | "size" | "value" | "defaultValue"> {
  allowDeselect?: boolean;
  checkIconPosition?: "left" | "right";
  clearable?: boolean;
  clearButtonProps?: CloseButtonProps & ElementProps<"button">;
  defaultSearchValue?: string;
  defaultValue?: string | null;
  itemComponent?: React.FC<any>;
  loading?: boolean;
  nothingFoundMessage?: React.ReactNode;
  onChange?(value: string | null): void;
  onScrollToBottom?: VoidFunction;
  onSearchChange?(value: string): void;
  searchable?: boolean;
  searchValue?: string;
  value?: string | null;
  withCheckIcon?: boolean;
  withinPortal?: boolean;
}

const defaultProps: Partial<VSelectProps> = {
  allowDeselect: false,
  checkIconPosition: "left",
  rightSectionPointerEvents: "none",
  searchable: false,
  withCheckIcon: true,
  withinPortal: false,
};

export function VSelect(_props: VSelectProps) {
  const { t } = useTranslation();
  const props = useProps("Select", defaultProps, _props);

  const {
    allowDeselect,
    checkIconPosition,
    classNames,
    clearable,
    clearButtonProps,
    comboboxProps,
    data,
    defaultDropdownOpened,
    defaultSearchValue,
    defaultValue,
    disabled,
    dropdownOpened,
    error,
    form,
    itemComponent: ItemComponent = VSelectDefaultItem,
    label,
    limit,
    loading,
    maxDropdownHeight,
    name,
    nothingFoundMessage = t("noResults"),
    onBlur,
    onChange,
    onClick,
    onDropdownClose,
    onDropdownOpen,
    onFocus,
    onScrollToBottom,
    onSearchChange,
    placeholder: placeholderProp,
    readOnly,
    rightSection,
    rightSectionPointerEvents,
    searchable,
    searchValue,
    size,
    styles,
    unstyled,
    value,
    withAsterisk,
    withCheckIcon,
    withinPortal,
    withScrollArea,
    ...others
  } = props;

  const theme = useMantineTheme();
  const parsedData = getParsedComboboxData(data);
  const optionsLockup = getOptionsLockup(parsedData);
  const placeholder = placeholderProp ?? t("select");

  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: null,
    onChange,
  });

  const selectedOption = _value ? optionsLockup[_value] : undefined;

  const [search, setSearch] = useUncontrolled({
    value: searchValue,
    defaultValue: defaultSearchValue,
    finalValue: selectedOption ? selectedOption.label : "",
    onChange: onSearchChange,
  });

  const combobox = useCombobox({
    opened: dropdownOpened,
    defaultOpened: defaultDropdownOpened,
    onDropdownOpen,
    onDropdownClose: () => {
      onDropdownClose?.();
      combobox.resetSelectedOption();
    },
  });

  const { resolvedClassNames, resolvedStyles } =
    useResolvedStylesApi<SelectFactory>({
      props,
      styles,
      classNames,
    });

  const rightSectionIcon = useMemo(() => {
    if (loading) {
      return (
        <FontAwesomeIcon
          icon={faSpinner}
          color={theme.colors.gray[2]}
          spin={loading}
        />
      );
    }
    return (
      <CustomIconSort
        color={
          combobox.dropdownOpened ? theme.colors.dark[5] : theme.colors.gray[2]
        }
      />
    );
  }, [loading, combobox.dropdownOpened]);

  // Seçili değerler üstte gösterilir
  const sortedParsedData = useMemo(() => {
    if (_value) {
      const selectedData = parsedData.find((item) => {
        if (isOptionsGroup(item)) {
          return item.items.find((childItem) => childItem.value === _value);
        }
        return (item as ComboboxItem).value === _value;
      });

      const filtered = parsedData.filter(Boolean).filter((item) => {
        if (isOptionsGroup(item)) {
          const found = item.items.some(
            (childItem) => childItem.value === _value,
          );

          return !found;
        }
        return (item as ComboboxItem).value !== _value;
      });

      return [selectedData].filter(Boolean).concat(filtered);
    }
    return parsedData;
  }, [parsedData, _value]);

  useEffect(() => {
    if (value === null) {
      setSearch("");
    }

    if (typeof value === "string" && selectedOption) {
      setSearch(selectedOption.label);
    }
  }, [value, selectedOption]);

  const placeholderContent = () => {
    if (searchable) {
      return null;
    }

    if (selectedOption) {
      return <ItemComponent {...selectedOption} />;
    }

    return <Input.Placeholder>{placeholder}</Input.Placeholder>;
  };

  const clearButton = clearable && !!_value && !disabled && !readOnly && (
    <Combobox.ClearButton
      size={size as string}
      {...clearButtonProps}
      onClear={() => {
        setValue(null);
        setSearch("");
      }}
    />
  );

  const { type, pointer, ...rest } = others;

  return (
    <>
      <Combobox
        store={combobox}
        __staticSelector="Select"
        classNames={resolvedClassNames}
        styles={resolvedStyles}
        unstyled={unstyled}
        readOnly={readOnly}
        size={size}
        onOptionSubmit={(val) => {
          const nextValue = allowDeselect
            ? optionsLockup[val].value === _value
              ? null
              : optionsLockup[val].value
            : optionsLockup[val].value;
          setValue(nextValue);
          setSearch(
            typeof nextValue === "string" ? optionsLockup[val].label : "",
          );
          combobox.closeDropdown();
        }}
        keepMounted={false}
        withinPortal={withinPortal}
        withArrow={false}
        position="bottom-start"
        {...comboboxProps}
      >
        <Combobox.Target targetType={searchable ? "input" : "button"}>
          <InputBase
            __staticSelector="Select"
            component={(searchable ? "input" : "button") as any}
            type={searchable ? "text" : "button"}
            pointer={!searchable}
            rightSection={
              allowDeselect && value
                ? null
                : rightSection || clearButton || rightSectionIcon
            }
            rightSectionPointerEvents={
              clearButton ? "all" : rightSectionPointerEvents
            }
            onChange={(event: React.ChangeEvent<any>) => {
              setSearch(event.currentTarget.value);
              combobox.openDropdown();
            }}
            onFocus={(event: React.FocusEvent<any>) => {
              if (searchable) {
                combobox.openDropdown();
              }

              onFocus?.(event);
            }}
            onBlur={(event: React.FocusEvent<any>) => {
              if (searchable) {
                combobox.closeDropdown();
              }

              setSearch(
                _value != null ? optionsLockup[_value]?.label || "" : "",
              );
              onBlur?.(event);
            }}
            onClick={(event: React.MouseEvent<any>) => {
              if (searchable) {
                combobox.openDropdown();
              } else {
                combobox.toggleDropdown();
              }

              onClick?.(event);
            }}
            classNames={{
              ...resolvedClassNames,
              input: clsx(classes.selectInput, resolvedClassNames.input),
              root: clsx(classes.selectRoot, resolvedClassNames.root),
            }}
            styles={resolvedStyles}
            unstyled={unstyled}
            label={label}
            size={size}
            value={search}
            disabled={disabled}
            readOnly={readOnly || !searchable}
            error={error}
            placeholder={placeholder}
            withAsterisk={withAsterisk}
            {...rest}
          >
            {placeholderContent()}
          </InputBase>
        </Combobox.Target>

        <VSelectOptionsDropdown
          hidden={readOnly || disabled}
          checkIconPosition={checkIconPosition}
          data={sortedParsedData as OptionsData}
          filterOptions={searchable && selectedOption?.label !== search}
          itemComponent={ItemComponent}
          limit={limit}
          maxDropdownHeight={maxDropdownHeight}
          nothingFoundMessage={loading ? t("loading") : nothingFoundMessage}
          onScrollToBottom={onScrollToBottom}
          search={search}
          value={_value}
          withScrollArea={withScrollArea as boolean}
          withCheckIcon={withCheckIcon}
        />
      </Combobox>
      <input
        type="hidden"
        name={name}
        value={_value || ""}
        form={form}
        disabled={disabled}
      />
    </>
  );
}
