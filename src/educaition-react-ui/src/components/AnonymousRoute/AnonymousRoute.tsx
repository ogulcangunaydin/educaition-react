import { LoadableComponent } from "@loadable/component";
import { EducaitionReactRoutes } from "@educaition-react/ui/constants";
import {
  useAuth,
  useRouteQueryParamValidation,
} from "@educaition-react/ui/hooks";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

type AnonymousRouteProps = Partial<{
  component: LoadableComponent<any> | React.ComponentType;
  requiredQueryParams: string | string[];
}>;

export function AnonymousRoute({
  component: Component,
  requiredQueryParams,
}: React.PropsWithChildren<AnonymousRouteProps>) {
  const queryParamValid = useRouteQueryParamValidation(
    requiredQueryParams || [],
  );
  const auth = useAuth();

  if (requiredQueryParams && !queryParamValid) {
    return (
      <Navigate
        to={
          auth
            ? EducaitionReactRoutes.Dashboard.href
            : EducaitionReactRoutes.Login.href
        }
        replace={true}
      />
    );
  }

  return Component ? <Component /> : <Outlet />;
}
