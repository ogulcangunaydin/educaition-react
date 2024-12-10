import dayjs from "dayjs";
import "dayjs/locale/tr";
import duration from "dayjs/plugin/duration";
import localeData from "dayjs/plugin/localeData";
import i18n, { DEFAULT_LANG } from "../i18n";

dayjs.extend(duration);
dayjs.extend(localeData);

i18n.on("languageChanged", (lang) => {
  dayjs.locale(lang || DEFAULT_LANG);
});
