export interface LoginPayload {
  email: string;
  password: string;
  username?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  companyName?: string;
  department?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  companyName?: string;
  department?: string;
  role?: string;
}
