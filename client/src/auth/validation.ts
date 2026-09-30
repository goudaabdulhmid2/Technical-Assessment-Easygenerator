import type { Credentials, SignupInput } from '../types/auth';

export type SignupErrors = Partial<Record<keyof SignupInput, string>>;
export type SigninErrors = Partial<Record<keyof Credentials, string>>;

export const passwordChecks = (password: string) => [
  { label: 'At least 8 characters', valid: password.length >= 8 },
  { label: 'Contains a letter', valid: /[A-Za-z]/.test(password) },
  { label: 'Contains a number', valid: /\d/.test(password) },
  { label: 'Contains a special character', valid: /[^A-Za-z0-9]/.test(password) },
];

export function validateSignup(values: SignupInput): SignupErrors {
  const errors: SignupErrors = {};
  if (values.name.trim().length < 3) errors.name = 'Name must be at least 3 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  const failedPasswordCheck = passwordChecks(values.password).find((check) => !check.valid);
  if (failedPasswordCheck) errors.password = 'Your password does not meet all the requirements.';
  return errors;
}

export function validateSignin(values: Credentials): SigninErrors {
  const errors: SigninErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.password) errors.password = 'Enter your password.';
  return errors;
}
