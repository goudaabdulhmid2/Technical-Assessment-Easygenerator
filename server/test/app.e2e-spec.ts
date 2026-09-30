import cookieParser from 'cookie-parser';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/controllers/auth.controller.js';
import { AuthService } from '../src/auth/services/auth.service.js';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard.js';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy.js';
import { PasswordService } from '../src/common/security/password/password.service.js';
import type { UserDocument } from '../src/users/schemas/user.schema.js';
import { UsersRepository } from '../src/users/repositories/users.repository.js';

describe('Authentication HTTP flow (e2e)', () => {
  const secret = 'test-only-secret-with-at-least-32-characters';
  const records = new Map<string, UserDocument>();
  let app: INestApplication<App>;

  beforeAll(async () => {
    records.clear();
    const repository = {
      findByEmail: async (email: string) => records.get(email) ?? null,
      findByEmailWithPassword: async (email: string) => records.get(email) ?? null,
      findById: async (id: string) =>
        [...records.values()].find((user) => user._id.toString() === id) ?? null,
      create: async (input: Partial<UserDocument>) => {
        const email = input.email as string;
        if (records.has(email)) throw { code: 11000 };
        const user = {
          ...input,
          _id: { toString: () => 'e2e-user-id' },
        } as unknown as UserDocument;
        records.set(email, user);
        return user;
      },
    } as unknown as UsersRepository;

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({ secret, signOptions: { expiresIn: '15m' } }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
        PasswordService,
        { provide: UsersRepository, useValue: repository },
        { provide: ConfigService, useValue: { getOrThrow: () => secret } },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Test API')
        .setVersion('1.0')
        .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie' }, 'access_token')
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document, {
      useGlobalPrefix: false,
      jsonDocumentUrl: 'api/docs-json',
    });
    await app.init();
  });

  afterAll(async () => app.close());

  it('signs up, signs in, authenticates from the cookie, and clears that cookie at logout', async () => {
    const agent = request.agent(app.getHttpServer());
    const signup = await agent.post('/api/v1/auth/signup').send({
      name: 'Alex Morgan',
      email: ' Alex@Example.com ',
      password: 'StrongPass1!',
    }).expect(201);
    expect(signup.body.user).toEqual({ id: 'e2e-user-id', name: 'Alex Morgan', email: 'alex@example.com' });
    expect(signup.body.user.password).toBeUndefined();

    const signin = await agent.post('/api/v1/auth/signin').send({
      email: 'alex@example.com',
      password: 'StrongPass1!',
    }).expect(200);
    expect(signin.headers['set-cookie'][0]).toContain('access_token=');
    expect(signin.headers['set-cookie'][0].toLowerCase()).toContain('httponly');

    await agent.get('/api/v1/auth/me').expect(200).expect(({ body }) => {
      expect(body.user.email).toBe('alex@example.com');
      expect(body.user.password).toBeUndefined();
    });

    await agent.post('/api/v1/auth/logout').expect(200);
    await agent.get('/api/v1/auth/me').expect(401);
  });

  it('rejects invalid signup input, unknown fields, duplicate email, and invalid credentials', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/signup').send({
      name: '   ', email: 'bad-email', password: 'weak', extra: true,
    }).expect(400);

    await request(app.getHttpServer()).post('/api/v1/auth/signup').send({
      name: 'Alex', email: 'alex@example.com', password: 'StrongPass1!',
    }).expect(409);

    await request(app.getHttpServer()).post('/api/v1/auth/signin').send({
      email: 'alex@example.com', password: 'incorrect1!',
    }).expect(401);
  });

  it('protects the current-user endpoint when no cookie is present', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
  });

  it('publishes the documented cookie-auth API schema', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
    expect(response.body.paths['/api/v1/auth/me']).toBeDefined();
    expect(response.body.components.securitySchemes.access_token).toMatchObject({
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
    });
  });
});
