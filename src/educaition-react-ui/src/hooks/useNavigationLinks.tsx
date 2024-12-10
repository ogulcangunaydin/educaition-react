import { faGamepad, faChair } from "@fortawesome/free-solid-svg-icons";
import { getRoute } from "@educaition-react/ui/constants";
import { NavigationLink } from "@educaition-react/ui/interfaces";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "./useUser";

function checkIfNavigationLinkIsValid(item: NavigationLink) {
  return (
    (item.items?.length ?? 0) > 0 ||
    !!item.href ||
    typeof item.onClick === "function"
  );
}

export function useNavigationLinks(): NavigationLink[] {
  const user = useUser();
  const { t, i18n } = useTranslation(["routes"]);

  const translateRoute = useCallback((key: string) => t(`routes:${key}`), []);

  return useMemo(
    () =>
      (
        [
          {
            id: "dissonanceTest",
            label: translateRoute("dissonanceTest"),
            icon: faChair,
            items: [
              getRoute("DissonanceTestParticipantList"),
              getRoute("DissonanceTest"),
            ],
          },
          {
            id: "prisonersDilemma",
            label: translateRoute("prisonersDilemma"),
            icon: faGamepad,
            items: [getRoute("GameRoom")],
          },
        ] as NavigationLink[]
      ).filter(checkIfNavigationLinkIsValid),
    [i18n.language, user],
  );
}
