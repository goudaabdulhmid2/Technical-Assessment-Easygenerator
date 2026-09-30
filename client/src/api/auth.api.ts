import { apiRequest } from './client';
import type { Credentials, SignupInput, User } from '../types/auth';

interface UserResponse {
  user: User;
}

export const authApi = {
  async currentUser(): Promise<User> {
    const response = await apiRequest<UserResponse>('/auth/me');
    return response.user;
  },

  async signIn(credentials: Credentials): Promise<User> {
    const response = await apiRequest<UserResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.user;
  },

  async signUp(input: SignupInput): Promise<User> {
    const response = await apiRequest<UserResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.user;
  },

  async signOut(): Promise<void> {
    await apiRequest<{ message: string }>('/auth/logout', { method: 'POST' });
  },
};
