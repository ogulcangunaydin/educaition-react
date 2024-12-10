import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { useHover, useListState } from "@mantine/hooks";
import { If } from "@educaition-react/ui/components";
import {
  useNavigationLinks,
  useNavigationLinksFlat,
} from "@educaition-react/ui/hooks";
import { NavigationLink } from "@educaition-react/ui/interfaces";
import {
  ensureArray,
  getHrefWithSearchParams,
} from "@educaition-react/ui/utils";
import clsx from "clsx";
import React, { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useMatches } from "react-router-dom";
import { LayoutNavigationLink } from "../LayoutNavigationLink";
import { LayoutNavigationLinkGroupItem } from "../LayoutNavigationLinkGroupItem";
import classes from "./LayoutNavigationMenu.module.scss";

export function LayoutNavigationMenu() {
  const navigationLinks = useNavigationLinks().filter(
    (item) => !item.hideFromNavigation,
  );
  const navigationLinksFlat = useNavigationLinksFlat();
  const location = useLocation();
  const matches = useMatches();
  const [activeLinkGroup, setActiveLinkGroup] = useState<
    NavigationLink | undefined
  >(undefined);
  const [menuOpenedState, menuOpenedStateHandlers] = useListState<{
    id: string;
    opened: boolean;
  }>(
    navigationLinks.map((item) => ({
      id: item.id,
      opened: false,
    })),
  );
  const {
    hovered: isActiveLinkGroupChildHovered,
    ref: activeLinkGroupChildRef,
  } = useHover<HTMLDivElement>();
  const mouseEnterDelayHandler = useRef<NodeJS.Timeout>();

  const handleSetFirstActiveLinkGroup = useCallback(
    (link: NavigationLink) => {
      const activeLink = navigationLinksFlat.find((item) =>
        matches.some((match) =>
          item.href ? match.pathname.includes(item.href) : false,
        ),
      );
      setActiveLinkGroup(
        activeLink?.parentNavigationLink ||
          (link.items ? link.items[0] : undefined),
      );
    },
    [setActiveLinkGroup, matches, navigationLinksFlat],
  );

  const handleLinkGroupMouseEnter = (group: NavigationLink) => {
    if (isActiveLinkGroupChildHovered) {
      return;
    }

    mouseEnterDelayHandler.current = setTimeout(() => {
      setActiveLinkGroup(group);
    }, 100);
  };

  const handleLinkGroupMouseLeave = () => {
    if (mouseEnterDelayHandler.current) {
      clearTimeout(mouseEnterDelayHandler.current);
      mouseEnterDelayHandler.current = undefined;
    }
  };

  const isAnyChildRouteActive: (link: NavigationLink) => boolean = useCallback(
    (link: NavigationLink) => {
      const items = ensureArray(link.items);
      if (items.length) {
        return items.some((item) => item && isAnyChildRouteActive(item));
      }

      return matches.some(
        (match) => link.href && match.pathname.includes(link.href),
      );
    },
    [matches],
  );

  const handleMenuClose = (index: number) => {
    menuOpenedStateHandlers.setItemProp(index, "opened", false);
  };

  const handleMenuOpen = (index: number) => {
    menuOpenedStateHandlers.setItemProp(index, "opened", true);
  };

  // Todo: @yavuz, Burada sadece setting menüsü vardı. bu yüzden tek bir alt menü için tasarlanmış.
  // Cati de geldi buraya 2. bir alt menü eklendi. Bu yüzden bu kısım refactor edilmeli.
  // şimdilik sadece settings menüsü için çalışacak şekilde ayarlandı.
  const isSettingsMenuOpenedState = useMemo(() => {
    return menuOpenedState.some(
      (item) => item.id === "settings" && item.opened,
    );
  }, [menuOpenedState]);

  return (
    <Group gap={20} className={classes.layoutNavigationMenu}>
      {navigationLinks.map((link, index) => (
        <Fragment key={link.id}>
          <If
            value={!link.items || link.items.length === 0 || !!link.itemsHidden}
          >
            <LayoutNavigationLink
              active={isAnyChildRouteActive(link)}
              application={link.application}
              label={link.label}
              icon={link.icon}
              to={link.href}
              data-testid={`layout-navigation-link-${link.id}`}
            />
          </If>

          <If
            value={!link.items || link.items.length === 0 || !!link.itemsHidden}
          >
            <Menu
              arrowPosition="center"
              position="bottom-start"
              opened={menuOpenedState[index].opened}
              onClose={() => handleMenuClose(index)}
              onOpen={() => handleMenuOpen(index)}
              zIndex={3}
              withArrow={true}
              trigger="hover"
              openDelay={100}
              closeDelay={300}
            >
              <Menu.Target>
                <UnstyledButton
                  className={classes.layoutNavigationMenuBtn}
                  data-testid={`layout-navigation-menu-btn-${link.id}`}
                  onClick={() => handleSetFirstActiveLinkGroup(link)}
                >
                  <LayoutNavigationLink
                    label={link.label}
                    icon={link.icon}
                    active={isAnyChildRouteActive(link)}
                  />

                  <FontAwesomeIcon
                    icon={faAngleDown}
                    fontSize={12}
                    className={classes.layoutNavigationMenuBtnIcon}
                  />
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown
                className={classes.layoutNavigationMenuDropdown}
                h={100}
              >
                <Group wrap="nowrap" align="stretch">
                  <Box
                    className={classes.layoutNavigationMenuDropdownLinks}
                    mih={isSettingsMenuOpenedState ? 356 : undefined}
                  >
                    {link.items?.map((item) => (
                      <LayoutNavigationLinkGroupItem
                        key={item.id}
                        onMouseEnter={handleLinkGroupMouseEnter}
                        onMouseLeave={handleLinkGroupMouseLeave}
                        item={item}
                        active={activeLinkGroup?.id === item.id}
                        onClick={() => handleMenuClose(index)}
                      />
                    ))}
                  </Box>

                  <div
                    className={clsx(
                      classes.layoutNavigationMenuDropdownLinksChild,
                      {
                        [classes.layoutNavigationMenuDropdownLinksChildActive]:
                          activeLinkGroup?.items?.length ||
                          isSettingsMenuOpenedState,
                      },
                    )}
                    ref={activeLinkGroupChildRef}
                  >
                    {activeLinkGroup?.items?.map((item) => (
                      <UnstyledButton
                        key={item.id}
                        component={NavLink as React.FC<any>}
                        to={getHrefWithSearchParams(item.href || "", location)}
                        className={
                          classes.layoutNavigationMenuDropdownLinksChildItem
                        }
                        onClick={() => handleMenuClose(index)}
                      >
                        <Text component="span" fz={12} fw={500}>
                          {item.label}
                        </Text>
                      </UnstyledButton>
                    ))}
                  </div>
                </Group>
              </Menu.Dropdown>
            </Menu>
          </If>
        </Fragment>
      ))}
    </Group>
  );
}
