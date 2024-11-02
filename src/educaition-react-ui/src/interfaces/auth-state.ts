import { Nullable } from "./nullable";
import { User } from "./user";

export interface AuthStateType {
  id: Nullable<number>;
  token: Nullable<string>;
  user: User;
  // TODO: Implement permissions in the future
  // permissions: Permission;
}
