import { User } from "@educaition-react/ui/interfaces";
import { useAppSelector } from "./useAppSelector";

export function useUser(): User {
  return useAppSelector((state) => state.AuthState.user);
}
