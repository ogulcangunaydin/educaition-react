import { generatePath } from "react-router-dom";
import qs from "qs";
import i18n from "@educaition-react/ui/i18n";
import {
  NavigationLink,
  NavigationLinkSimple,
} from "@educaition-react/ui/interfaces";

type RouteKeys =
  | "Root"
  | "Login"
  | "Dashboard"
  | "GameRoom"
  | "Playground"
  | "TacticPreparation"
  | "Leaderboard"
  | "PersonalityTest"
  | "DissonanceTestParticipantList"
  | "DissonanceTest"
  | "DissonanceTestResult";

export interface RouteDefinition extends Omit<NavigationLinkSimple, "label"> {
  translationKey?: string;
}

export const EducaitionReactRoutes: Record<RouteKeys, RouteDefinition> = {
  Root: {
    href: "/",
  },
  Login: {
    href: "/login",
    translationKey: "login",
  },
  Dashboard: {
    href: "/dashboard",
    translationKey: "dashboard",
  },
  GameRoom: {
    href: "/dashboard/rooms",
    translationKey: "gameRoom",
  },
  Playground: {
    href: "/dashboard/playground/:roomId",
    translationKey: "playground",
  },
  TacticPreparation: {
    href: "/dashboard/tacticpreparation/:roomId",
    translationKey: "tacticPreparation",
  },
  Leaderboard: {
    href: "/dashboard/leaderboard/:sessionId",
    translationKey: "leaderboard",
  },
  PersonalityTest: {
    href: "/dashboard/personalitytest/:type/:id",
    translationKey: "personalityTest",
  },
  DissonanceTestParticipantList: {
    href: "/dashboard/dissonanceTestParticipantList",
    translationKey: "dissonanceTestParticipantList",
  },
  DissonanceTest: {
    href: "/dashboard/dissonanceTest/:currentUserId",
    translationKey: "dissonanceTest",
  },
  DissonanceTestResult: {
    href: "/dashboard/dissonanceTestResult/:participantId",
    translationKey: "dissonanceTestResult",
  },
};

const SearchableRoutes = Object.entries(EducaitionReactRoutes).map(
  ([key, routeDefinition]) => ({
    key,
    routeDefinition,
  }),
);

export function getRoute(key: RouteKeys): Partial<NavigationLink> {
  const { href, translationKey, ...rest } =
    SearchableRoutes.find((route) => route.key === key)?.routeDefinition || {};
  return {
    ...rest,
    id: key,
    label: i18n.t(`routes:${translationKey}`),
    href,
  };
}

export function routeWithParameters(
  route: string,
  parameters: Record<string, any> = {},
): string {
  return generatePath(route, parameters);
}

export function routeWithQueryParameters(
  route: string,
  parameters: Record<string, any> = {},
): string {
  const params = qs.stringify(parameters);
  return `${route}?${params}`;
}
