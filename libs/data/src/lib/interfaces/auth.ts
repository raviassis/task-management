export interface UserProfile {
  sub: number;
  id: number;
  email: string;
  name: string;
}

export interface User extends UserProfile {
  access_token: string;
}