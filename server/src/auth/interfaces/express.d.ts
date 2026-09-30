import type { AuthUser } from './auth-user.interface.js';

declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
      cookies: Record<string, string>;
    }
  }
}

export {};
