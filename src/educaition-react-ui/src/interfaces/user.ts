import { Role } from "../enums";

export interface User {
  id: number;
  email: string;
  token: string;
  language: string;
  name: string;
  theme: string;
  role: Role;
  avatar_color: string;
}
