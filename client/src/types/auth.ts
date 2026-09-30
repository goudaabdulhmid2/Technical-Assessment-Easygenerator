export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignupInput extends Credentials {
  name: string;
}

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'error';
