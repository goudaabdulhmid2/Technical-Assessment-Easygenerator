import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserDocument } from '../../users/schemas/user.schema.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { PasswordService } from '../../common/security/password/password.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const validPassword = 'correct1!';
  let service: AuthService;
  let users: Map<string, UserDocument>;
  let createUser: (data: Partial<UserDocument>) => Promise<UserDocument>;

  beforeEach(() => {
    users = new Map();
    createUser = async (data) => {
      const email = data.email as string;
      if (users.has(email)) throw { code: 11000 };
      const user = {
        ...data,
        _id: { toString: () => 'user-1' },
      } as unknown as UserDocument;
      users.set(email, user);
      return user;
    };
    const repository = {
      create: (data: Partial<UserDocument>) => createUser(data),
      findByEmail: async (email: string) => users.get(email) ?? null,
      findByEmailWithPassword: async (email: string) => users.get(email) ?? null,
      findById: async (id: string) =>
        [...users.values()].find((user) => user._id.toString() === id) ?? null,
    } as unknown as UsersRepository;
    const passwords = {
      hash: async (password: string) => `hashed:${password}`,
      verify: async (hash: string, password: string) => hash === `hashed:${password}`,
    } as unknown as PasswordService;
    const jwt = {
      signAsync: async (payload: object) => `signed:${JSON.stringify(payload)}`,
    } as unknown as JwtService;
    service = new AuthService(repository, passwords, jwt);
  });

  it('normalizes email and stores only the hashed password', async () => {
    const user = await service.signup({
      name: '  Alex Morgan  ',
      email: '  Alex@Example.com ',
      password: validPassword,
    });
    expect(user.email).toBe('alex@example.com');
    expect(user.name).toBe('Alex Morgan');
    expect(user.password).toBe(`hashed:${validPassword}`);
    expect(user.password).not.toBe(validPassword);
  });

  it('rejects existing emails and duplicate-key signup races as conflicts', async () => {
    await service.signup({ name: 'Alex', email: 'alex@example.com', password: validPassword });
    await expect(service.signup({ name: 'Other', email: 'ALEX@example.com', password: validPassword }))
      .rejects.toBeInstanceOf(ConflictException);

    createUser = async () => { throw { code: 11000 }; };
    await expect(service.signup({ name: 'Other', email: 'other@example.com', password: validPassword }))
      .rejects.toBeInstanceOf(ConflictException);
  });

  it('signs in for valid credentials and rejects missing users or wrong passwords', async () => {
    await service.signup({ name: 'Alex', email: 'alex@example.com', password: validPassword });
    await expect(service.signin({ email: 'ALEX@example.com', password: validPassword }))
      .resolves.toMatchObject({ accessToken: 'signed:{"sub":"user-1"}' });
    await expect(service.signin({ email: 'missing@example.com', password: validPassword }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.signin({ email: 'alex@example.com', password: 'wrong1!!' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns the current user and reports deleted or missing users', async () => {
    await service.signup({ name: 'Alex', email: 'alex@example.com', password: validPassword });
    await expect(service.getCurrentUser('user-1')).resolves.toMatchObject({ email: 'alex@example.com' });
    await expect(service.getCurrentUser('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
