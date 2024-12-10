import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Combobox,
  Divider,
  OptionsData,
  OptionsFilter,
  ScrollArea,
  ThemeIcon,
  defaultOptionsFilter,
  isOptionsGroup,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import classes from "./VSelect.module.scss";
import { isEmptyComboboxData } from "./VSelect.utils";
import { VSelectOption } from "./VSelectOption";

interface VSelectDropdownScrollPosition {
  scrollY: number;
  scrollHeight: number;
}

interface VSelectOptionsDropdownProps {
  checkIconPosition?: "left" | "right";
  data: OptionsData;
  filter?: OptionsFilter | undefined;
  filterOptions?: boolean;
  hidden?: boolean;
  hiddenWhenEmpty?: boolean;
  itemComponent?: React.FC<any>;
  limit: number | undefined;
  maxDropdownHeight: number | string | undefined;
  nothingFoundMessage?: React.ReactNode;
  onDeselectAll?: VoidFunction;
  onScrollToBottom?: VoidFunction;
  onSelectAll?: VoidFunction;
  search: string | undefined;
  value?: string | string[] | null;
  withCheckIcon?: boolean;
  withScrollArea: boolean;
  withSelectAll?: boolean;
}

export function VSelectOptionsDropdown({
  checkIconPosition,
  data,
  filter,
  filterOptions,
  hidden,
  hiddenWhenEmpty,
  itemComponent,
  limit,
  maxDropdownHeight = 220,
  nothingFoundMessage,
  onScrollToBottom,
  onSelectAll,
  onDeselectAll,
  search,
  value,
  withCheckIcon = true,
  withScrollArea = true,
  withSelectAll,
}: VSelectOptionsDropdownProps) {
  const { t } = useTranslation();
  const viewport = useRef<HTMLDivElement>(null);
  const [currentScrollPosition, setCurrentScrollPosition] =
    useState<VSelectDropdownScrollPosition>();
  const [debouncedScrollPosition] = useDebouncedValue(
    currentScrollPosition,
    200,
  );
  const shouldFilter = typeof search === "string";
  const filteredData = shouldFilter
    ? (filter || defaultOptionsFilter)({
        options: data,
        search: filterOptions ? search : "",
        limit: limit ?? Infinity,
      })
    : data;
  const isEmpty = isEmptyComboboxData(filteredData);
  const [isAnyOptionSelected, setIsAnyOptionSelected] = useState(false);
  const isFirstDataIsGroup = filteredData.length
    ? isOptionsGroup(filteredData[0])
    : false;

  const options = filteredData.map((item, index) => (
    <VSelectOption
      data={item}
      key={isOptionsGroup(item) ? `${item.group}-${index}` : item.value}
      withCheckIcon={withCheckIcon}
      value={value}
      checkIconPosition={checkIconPosition}
      itemComponent={itemComponent}
    />
  ));

  const handleOnScrollPositionChange = ({ y }: { x: number; y: number }) => {
    const scrollHeight = viewport.current
      ? viewport.current.scrollHeight - Number(maxDropdownHeight)
      : 0;
    const verticalPosition = Math.ceil(y);
    setCurrentScrollPosition({
      scrollY: verticalPosition,
      scrollHeight,
    });
  };

  const handleOnScrollToBottom = ({
    scrollY,
    scrollHeight,
  }: VSelectDropdownScrollPosition) => {
    const offset = 50;

    if (scrollY + offset > scrollHeight) {
      onScrollToBottom?.();
    }
  };

  const handleToggleSelectAll = () => {
    if (isAnyOptionSelected) {
      onDeselectAll?.();
    } else {
      onSelectAll?.();
    }
  };

  useEffect(() => {
    if (!debouncedScrollPosition) {
      return;
    }
    handleOnScrollToBottom(debouncedScrollPosition);
  }, [debouncedScrollPosition]);

  useEffect(() => {
    setIsAnyOptionSelected((value?.length ?? 0) > 0);
  }, [value]);

  return (
    <Combobox.Dropdown
      classNames={{
        dropdown: classes.optionsDropdown,
      }}
      hidden={hidden || (hiddenWhenEmpty && isEmpty)}
    >
      <Combobox.Options>
        {withSelectAll && !isEmpty && (
          <>
            <Button
              data-testid="button-select-all"
              classNames={{
                root: classes.optionsSelectAllBtn,
                section: classes.optionsSelectAllBtnSection,
              }}
              variant="subtle"
              color="gray"
              size="compact-xs"
              fullWidth={true}
              justify="left"
              px={0}
              leftSection={
                <ThemeIcon
                  className={classes.optionsSelectAllBtnIcon}
                  variant="transparent"
                  size={20}
                  color="gray"
                >
                  <FontAwesomeIcon icon={faCheck} fontSize={14} />
                </ThemeIcon>
              }
              onClick={handleToggleSelectAll}
            >
              {t(isAnyOptionSelected ? "deselect" : "selectAll")}
            </Button>
            {!isFirstDataIsGroup && <Divider my={10} />}
          </>
        )}
        {withScrollArea ? (
          <ScrollArea.Autosize
            viewportRef={viewport}
            mah={maxDropdownHeight}
            type="scroll"
            onScrollPositionChange={handleOnScrollPositionChange}
            className={classes.optionsDropdownScrollArea}
          >
            {options}
          </ScrollArea.Autosize>
        ) : (
          options
        )}
        {isEmpty && nothingFoundMessage && (
          <Combobox.Empty>{nothingFoundMessage}</Combobox.Empty>
        )}
      </Combobox.Options>
    </Combobox.Dropdown>
  );
}
