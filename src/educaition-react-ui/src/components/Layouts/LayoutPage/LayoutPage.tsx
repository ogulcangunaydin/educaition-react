import React from "react";
import { Outlet } from "react-router-dom";

interface LayoutPageProps {
  backTo?: string;
}

export function LayoutPage({
  children,
}: React.PropsWithChildren<LayoutPageProps>) {
  return <>{children || <Outlet />}</>;
}
