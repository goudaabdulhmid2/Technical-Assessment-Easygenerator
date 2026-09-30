import { describe, expect, it } from 'vitest';
import { passwordChecks, validateSignin, validateSignup } from './validation';

describe('signup validation', () => {
  it('accepts values that meet the backend signup rules', () => {
    expect(validateSignup({ name: 'Alex Morgan', email: 'alex@example.com', password: 'StrongPass1!' })).toEqual({});
  });

  it('reports invalid email, short names, and each missing password requirement', () => {
    expect(validateSignup({ name: ' Jo ', email: 'not-an-email', password: 'short' })).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
    });
    expect(passwordChecks('short').map((check) => check.valid)).toEqual([false, true, false, false]);
  });

  it('does not accept whitespace-only names', () => {
    expect(validateSignup({ name: '   ', email: 'alex@example.com', password: 'StrongPass1!' }).name).toBeDefined();
  });
});

describe('signin validation', () => {
  it('requires a valid email and a non-empty password', () => {
    expect(validateSignin({ email: 'bad', password: '' })).toMatchObject({
      email: expect.any(String),
      password: expect.any(String),
    });
    expect(validateSignin({ email: 'alex@example.com', password: 'secret' })).toEqual({});
  });
});
