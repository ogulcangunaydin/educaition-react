import { AppDispatch } from "@educaition-react/ui/store";
import { useDispatch } from "react-redux";

export function useAppDispatch() {
  return useDispatch<AppDispatch>();
}
