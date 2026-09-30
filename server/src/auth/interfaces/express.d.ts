import { AuthUser } from './auth-user.interface';

declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
      cookies: Record<string, string>;
    }
  }
}

export {};