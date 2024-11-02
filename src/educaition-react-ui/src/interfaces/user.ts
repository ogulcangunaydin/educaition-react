export interface User {
  id: number;
  name: string;
  password: string;
  token: string;
  language: string;
  email?: string;
  avatar?: string;
}
