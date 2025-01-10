import { LoadableComponent } from "@loadable/component";
import { EducaitionReactRoutes } from "@educaition-react/ui/constants";
import {
  useAppSelector,
  useAuth,
  useRouteQueryParamValidation,
} from "@educaition-react/ui/hooks";
import React, { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useLanguagesQuery } from "@educaition-react/ui/services";

interface PublicRouteProps {
  component: LoadableComponent<any> | React.ComponentType;
  redirect?: string;
  requiredQueryParams?: string | string[];
}

/**
 * To render the component, require the user to be unauthenticated.
 * If the user is authenticated, redirect them to the specified URL.
 */
export function PublicRoute({
  component: Component,
  redirect = EducaitionReactRoutes.Dashboard.href,
  requiredQueryParams,
}: PublicRouteProps) {
  const queryParamValid = useRouteQueryParamValidation(
    requiredQueryParams || "",
  );
  const auth = useAuth();
  const { token, user } = useAppSelector((state) => state.AuthState);
  const shouldAuthenticate = useMemo(() => !!token && !user, [token, user]);

  /*
   * Get languages from backend
   * */
  useLanguagesQuery();

  if (shouldAuthenticate || auth || (requiredQueryParams && !queryParamValid)) {
    return <Navigate to={redirect} replace={true} />;
  }

  return Component ? <Component /> : <Outlet />;
}
