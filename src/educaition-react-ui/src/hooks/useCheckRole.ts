import { Role } from "@educaition-react/ui/enums";
import { User } from "@educaition-react/ui/interfaces";
import { useMemo } from "react";
import { useUser } from "./useUser";

export function checkRole(user: User, role: Role) {
  return role === user.role;
}

export function useCheckRole(role: Role): boolean {
  const user = useUser();

  return useMemo(() => {
    if (!role) {
      return true;
    }
    return checkRole(user, role);
  }, [user, role]);
}
