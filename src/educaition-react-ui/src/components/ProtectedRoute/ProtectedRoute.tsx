import { LoadableComponent } from "@loadable/component";
import { SplashScreen } from "@educaition-react/ui/components";
import { EducaitionReactRoutes } from "@educaition-react/ui/constants";
import { Role } from "@educaition-react/ui/enums";
import {
  useAppDispatch,
  useAppSelector,
  useRouteQueryParamValidation,
  useCheckRole,
} from "@educaition-react/ui/hooks";
import {
  useLanguagesQuery,
  useLazyAuthenticateQuery,
} from "@educaition-react/ui/services";
import { logoutAction } from "@educaition-react/ui/store";
import React, { useMemo, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffectOnce } from "react-use";

const NOTIFICATION_PERMISSION_ID = "notification-permission";

export type ProtectedRouteProps = Partial<{
  component: LoadableComponent<any> | React.ComponentType;
  permission: string;
  redirect: string;
  requiredQueryParams: string | string[];
  role: Role;
}>;

/**
 * To render the component, require the user to be authenticated.
 * If the user is not authenticated, redirect them to the specified URL.
 */
export function ProtectedRoute({
  component: Component,
  redirect = "/login",
  requiredQueryParams,
  role,
}: React.PropsWithChildren<ProtectedRouteProps>) {
  const userRolePermitted = useCheckRole(role || Role.PARTICIPANT);
  const location = useLocation();
  const notificationId = useRef<string>();
  const queryParamValid = useRouteQueryParamValidation(
    requiredQueryParams || [],
  );
  const dispatch = useAppDispatch();
  const { token, user, id } = useAppSelector((state) => state.AuthState);
  const shouldAuthenticate = useMemo(() => !!token && !user, [token, user]);
  const [getUser, { isLoading: isUserLoading }] = useLazyAuthenticateQuery();

  const routeAllowed = useMemo(() => {
    return [{ value: role, valid: userRolePermitted }]
      .filter(({ value }) => {
        if (!value) {
          return false;
        }
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return true;
      })
      .every(({ valid }) => valid);
  }, [role, userRolePermitted]);

  /*
   * Get languages from backend
   * */
  useLanguagesQuery();

  /*
   * Make connection to socket
   * */
  // useAuthenticatedSocket();

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  const authenticate = () => {
    if (!shouldAuthenticate) {
      return;
    }

    if (token) {
      getUser({
        id: id?.toString() || "",
        token,
      })
        .unwrap()
        .catch(handleLogout);
    } else {
      handleLogout();
    }
  };

  useEffectOnce(() => authenticate());

  const navigateToDashboard = (
    <Navigate
      to={EducaitionReactRoutes.Dashboard.href}
      state={{ from: location }}
      replace={true}
    />
  );

  function showNotificationAndNavigateToDashboard() {
    notificationId.current = NOTIFICATION_PERMISSION_ID;
    return navigateToDashboard;
  }

  /*
   * If token doesn't exist, redirect to /login by default
   */
  if (!token) {
    return <Navigate to={redirect} state={{ from: location }} replace={true} />;
  }

  /*
   * If token exists then wait for user to load
   * Fetching user info from backend
   */
  if (shouldAuthenticate || isUserLoading) {
    return <SplashScreen />;
  }

  /*
   * If permission, role and accountType needed for route, and it is not valid
   * Then redirect to /dashboard by default
   */
  if (!routeAllowed) {
    return showNotificationAndNavigateToDashboard();
  }

  /*
   * If query params needed for route, and if some of them are missing
   * Then redirect to /dashboard by default
   */
  if (requiredQueryParams && !queryParamValid) {
    return navigateToDashboard;
  }

  /*
   * If everything is valid then render the route component or outlet
   */
  return Component ? <Component /> : <Outlet />;
}
