import { Role } from "../enums";

export interface User {
  id: number;
  name: string;
  password: string;
  token: string;
  language: string;
  theme: string;
  role: Role;
  email?: string;
  avatar_color?: string;
}
