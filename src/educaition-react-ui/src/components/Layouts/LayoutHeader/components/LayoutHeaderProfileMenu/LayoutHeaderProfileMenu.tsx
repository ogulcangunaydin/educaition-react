import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  CloseButton,
  Group,
  Popover,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AvatarWithIndicator, VSelect } from "@educaition-react/ui/components";
import { useAppDispatch, useUser } from "@educaition-react/ui/hooks";
import {
  useLogoutMutation,
  useUpdateAuthUserMutation,
} from "@educaition-react/ui/services";
import { logoutAction } from "@educaition-react/ui/store";
import { useTranslation } from "react-i18next";
import { useLockBodyScroll } from "react-use";
import classes from "./LayoutHeaderProfileMenu.module.scss";

export function LayoutHeaderProfileMenu() {
  const { t, i18n } = useTranslation();
  const user = useUser();
  const dispatch = useAppDispatch();
  const [postLogout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [updateUser] = useUpdateAuthUserMutation();
  const [profileMenuOpen, profileMenuHandlers] = useDisclosure(false);
  const selectItemLangs = [
    { value: "en", label: "English" },
    { value: "tr", label: "Türkçe" },
  ];

  useLockBodyScroll(profileMenuOpen);

  const handleSignOut = () => {
    postLogout()
      .unwrap()
      .then(() => dispatch(logoutAction()));
  };

  const handleChangeLanguage = (value: string) => {
    if (value === i18n.language) {
      return;
    }

    i18n.changeLanguage(value);

    updateUser({ id: user.id, language: value });
  };

  return (
    <Popover
      width={300}
      offset={7}
      position="top-end"
      opened={profileMenuOpen}
      onClose={profileMenuHandlers.close}
      onOpen={profileMenuHandlers.open}
      keepMounted={true}
    >
      <Popover.Target>
        <Tooltip label={t("profile")}>
          <UnstyledButton
            data-testid="button-header-profile-menu"
            onClick={profileMenuHandlers.open}
          >
            <AvatarWithIndicator
              avatarColor={user.avatar_color || "#000"}
              avatarSize={36}
              name={user.name}
            />
          </UnstyledButton>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown className={classes.layoutHeaderAccountDropdown}>
        <Group justify="flex-end">
          <CloseButton
            onClick={profileMenuHandlers.close}
            color="gray"
            data-testid="button-header-profile-menu-close"
          />
        </Group>

        <Stack align="center">
          <AvatarWithIndicator
            avatarColor={user.avatar_color || "#000"}
            avatarSize={85}
            indicatorSize={16}
            name={user.name}
            offset={12}
          />

          <Text
            size="md"
            mt={10}
            c="gray"
            fw={500}
            data-testid="text-header-profile-menu-name"
          >
            {user.name}
          </Text>
          <Text size="xs" c="gray" data-testid="text-header-profile-menu-phone">
            {user.email}
          </Text>
        </Stack>

        <Group justify="space-between" mt={20} mb={10}>
          <VSelect
            data-testid="input-header-profile-menu-language"
            classNames={{
              dropdown: classes.layoutHeaderLangDropdown,
              input: classes.layoutHeaderLangDropdownInput,
              option: classes.layoutHeaderLangDropdownOption,
            }}
            color="gray"
            value={i18n.language}
            data={selectItemLangs}
            onChange={handleChangeLanguage}
            rightSection={<FontAwesomeIcon icon={faGlobe} />}
            withScrollArea={false}
          />
        </Group>

        {/* <Anchor
          onClick={profileMenuHandlers.close}
          component={Link}
          to={routeWithQueryParameters(EducaitionReactRoutes.Profile.href, { selectedArea: "changePassword" })}
          c="gray"
          className={classes.layoutHeaderLink}
          data-testid="link-header-profile-menu-change-password"
        >
          <Group justify="space-between">
            <Group gap={13}>
              <FontAwesomeIcon icon={faKey} />
              {t("changePassword")}
            </Group>
            <FontAwesomeIcon icon={faAngleRight} />
          </Group>
        </Anchor> */}

        <Button
          data-testid="button-header-profile-menu-sign-out"
          size="xs"
          mt={10}
          fz={14}
          fullWidth={true}
          className={classes.signOutBtn}
          onClick={handleSignOut}
          loading={isLogoutLoading}
          disabled={isLogoutLoading}
        >
          {t("signOut")}
        </Button>
      </Popover.Dropdown>
    </Popover>
  );
}
