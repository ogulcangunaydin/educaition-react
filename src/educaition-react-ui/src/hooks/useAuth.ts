import { useUser } from "./useUser";
import { useMemo } from "react";

export function useAuth() {
  const user = useUser();

  return useMemo(() => !!user && Object.keys(user).length > 0, [user]);
}
