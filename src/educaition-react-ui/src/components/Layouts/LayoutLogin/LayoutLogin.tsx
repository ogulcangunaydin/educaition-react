import { Group, Image, Skeleton } from "@mantine/core";
import { EducaitionReactRoutes } from "@educaition-react/ui/constants";
import { If, VSelect } from "@educaition-react/ui/components";
import { Link } from "react-router-dom";
// import { EducaitionLogo } from "../../EducaitionLogo";
import classes from "./LayoutLogin.module.scss";
import EducaitionLogo from "@educaition-react/ui/images/header/educaition-logo.png";
import { useTranslation } from "react-i18next";
import { useSelectItemLanguages } from "@educaition-react/ui/hooks";

export function LayoutLogin({ children }: React.PropsWithChildren) {
  const { i18n } = useTranslation();
  const { selectItemLangs } = useSelectItemLanguages();

  const handleChangeLanguage = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className={classes.pageLoginLayout} data-testid="section-login-layout">
      <div className={classes.pageLoginLayoutBg} />

      <Group justify="space-between" align="flex-start">
        <Link to={EducaitionReactRoutes.Login.href} data-testid="link-logo">
          <Image src={EducaitionLogo} w={200} />
        </Link>

        <Group
          className={classes.pageLoginLayoutLanguage}
          wrap="nowrap"
          gap={10}
        >
          <If value={!selectItemLangs.length}>
            <Skeleton
              visible={!selectItemLangs.length}
              height={40}
              width={82}
            />
          </If>

          <If value={selectItemLangs.length > 0}>
            <VSelect
              className={classes.languageBtn}
              defaultValue={i18n.language}
              data={selectItemLangs}
              onChange={handleChangeLanguage}
              data-testid="input-language-select"
              searchable={false}
            />
          </If>
        </Group>
      </Group>

      <div className={classes.pageLoginLayoutContent}>
        <div className={classes.pageLoginLayoutContentBody}>{children}</div>
      </div>
    </div>
  );
}
