import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { validateSignin } from '../auth/validation';
import type { SigninErrors } from '../auth/validation';
import type { Credentials } from '../types/auth';
import { AuthFrame } from '../components/AuthFrame';

export function SigninPage() {
  const [values, setValues] = useState<Credentials>({ email: '', password: '' });
  const [errors, setErrors] = useState<SigninErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { signIn, logoutNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { notice?: string; from?: string } | null;

  function update(field: keyof Credentials, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (hasSubmitted) setErrors(validateSignin(next));
    setFormError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    const validationErrors = validateSignin(values);
    setErrors(validationErrors);
    setFormError('');
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signIn({ ...values, email: values.email.trim() });
      navigate(state?.from || '/app', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) setFormError(error.message);
      else setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame mode="signin">
      <span className="eyebrow">WELCOME BACK</span>
      <h2 id="form-title">Sign in to your space</h2>
      <p className="form-intro">Pick up where you left off. Your workspace is waiting.</p>

      {state?.notice && <div className="feedback feedback-success" role="status"><span aria-hidden="true">✓</span>{state.notice}</div>}
      {logoutNotice && <div className="feedback feedback-error" role="status"><span aria-hidden="true">!</span>{logoutNotice}</div>}
      {formError && <div className="feedback feedback-error" role="alert"><span aria-hidden="true">!</span>{formError}</div>}

      <form className="auth-form signin-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="signin-email">Email address</label>
          <input id="signin-email" name="email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'signin-email-error' : undefined} placeholder="you@example.com" />
          {errors.email && <span className="field-error" id="signin-email-error">{errors.email}</span>}
        </div>
        <div className="field-group">
          <div className="label-row"><label htmlFor="signin-password">Password</label><span className="label-hint">Your account stays private</span></div>
          <input id="signin-password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={(event) => update('password', event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'signin-password-error' : undefined} placeholder="Enter your password" />
          {errors.password && <span className="field-error" id="signin-password-error">{errors.password}</span>}
        </div>
        <button className="button button-primary submit-button" type="submit" disabled={submitting}>
          {submitting ? <><span className="button-spinner" aria-hidden="true" /> Signing in…</> : <>Sign in <span aria-hidden="true">↗</span></>}
        </button>
      </form>
      <p className="form-legal">Your sign-in is protected by a secure, HttpOnly session cookie.</p>
      <p className="mobile-switch">New around here? <Link to="/signup">Create an account</Link></p>
    </AuthFrame>
  );
}
