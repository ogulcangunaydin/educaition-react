import { Navigate, createBrowserRouter } from "react-router-dom";
import loadable from "@loadable/component";
import {
  LayoutDashboard,
  ProtectedRoute,
  PublicRoute,
} from "@educaition-react/ui/components";
import { EducaitionReactRoutes } from "@educaition-react/ui/constants";
// import * as Sentry from "@sentry/react";

const Login = loadable(() => import("./pages/Login/Login"));

const Playground = loadable(() => import("./pages/playGround"));
const GameRoom = loadable(() => import("./pages/gameRoom"));
const TacticPreparation = loadable(() => import("./pages/tacticPreparation"));
// const Leaderboard = loadable(() => import("./pages/leaderBoard"));
const PersonalityTest = loadable(
  () => import("./pages/PersonalityTest/personalityTest"),
);
const Dashboard = loadable(() => import("./pages/dashboard"));
const DissonanceTestParticipantList = loadable(
  () => import("./pages/dissonanceTestParticipantList"),
);
// const DissonanceTest = loadable(() => import("./pages/dissonanceTest"));
const DissonanceTestResult = loadable(
  () => import("./pages/dissonanceTestResult"),
);

// const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const EducaitionReactRouter = createBrowserRouter([
  {
    path: EducaitionReactRoutes.Root.href,
    element: <Navigate to={EducaitionReactRoutes.Login.href} replace={true} />,
  },
  {
    path: EducaitionReactRoutes.Login.href,
    element: <PublicRoute component={Login} />,
  },
  {
    path: EducaitionReactRoutes.Dashboard.href,
    element: <ProtectedRoute component={LayoutDashboard} />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: EducaitionReactRoutes.GameRoom.href,
        element: <ProtectedRoute component={GameRoom} />,
      },
      {
        path: EducaitionReactRoutes.Playground.href,
        element: <ProtectedRoute component={Playground} />,
      },
      {
        path: EducaitionReactRoutes.TacticPreparation.href,
        element: <ProtectedRoute component={TacticPreparation} />,
      },
      // {
      //   path: EducaitionReactRoutes.Leaderboard.href,
      //   element: <ProtectedRoute component={Leaderboard} />,
      // },
      {
        path: EducaitionReactRoutes.PersonalityTest.href,
        element: <ProtectedRoute component={PersonalityTest} />,
      },
      {
        path: EducaitionReactRoutes.DissonanceTestParticipantList.href,
        element: <ProtectedRoute component={DissonanceTestParticipantList} />,
      },
      // {
      //   path: EducaitionReactRoutes.DissonanceTest.href,
      //   element: <ProtectedRoute component={DissonanceTest} />,
      // },
      {
        path: EducaitionReactRoutes.DissonanceTestResult.href,
        element: <ProtectedRoute component={DissonanceTestResult} />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={EducaitionReactRoutes.Login.href} replace={true} />,
  },
]);
