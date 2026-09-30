import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ApiError } from '../api/client';
import { authApi } from '../api/auth.api';
import { AuthFrame } from '../components/AuthFrame';
import { passwordChecks, validateSignup } from '../auth/validation';
import type { SignupErrors } from '../auth/validation';
import type { SignupInput } from '../types/auth';

const initialValues: SignupInput = { name: '', email: '', password: '' };

export function SignupPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const navigate = useNavigate();
  const checks = passwordChecks(values.password);

  function update(field: keyof SignupInput, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (hasSubmitted) setErrors(validateSignup(next));
    setFormError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    const validationErrors = validateSignup(values);
    setErrors(validationErrors);
    setFormError('');
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await authApi.signUp({ ...values, name: values.name.trim(), email: values.email.trim() });
      navigate('/signin', { replace: true, state: { notice: 'Your account is ready. Sign in to continue.' } });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        setErrors((current) => ({ ...current, ...error.fieldErrors }));
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame mode="signup">
      <span className="eyebrow">GET STARTED</span>
      <h2 id="form-title">Create your account</h2>
      <p className="form-intro">A good place to begin. Set up your account in a moment.</p>

      {formError && <div className="feedback feedback-error" role="alert"><span aria-hidden="true">!</span>{formError}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" autoComplete="name" value={values.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} placeholder="e.g. Alex Morgan" />
          {errors.name && <span className="field-error" id="name-error">{errors.name}</span>}
        </div>

        <div className="field-group">
          <label htmlFor="signup-email">Email address</label>
          <input id="signup-email" name="email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'signup-email-error' : undefined} placeholder="you@example.com" />
          {errors.email && <span className="field-error" id="signup-email-error">{errors.email}</span>}
        </div>

        <div className="field-group">
          <div className="label-row"><label htmlFor="signup-password">Password</label><span className="label-hint">Keep it secure</span></div>
          <input id="signup-password" name="new-password" type="password" autoComplete="new-password" value={values.password} onChange={(event) => update('password', event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby="password-rules signup-password-error" placeholder="Create a password" />
          <ul className="password-rules" id="password-rules" aria-label="Password requirements">
            {checks.map((check) => <li className={check.valid ? 'rule-valid' : ''} key={check.label}><span aria-hidden="true">{check.valid ? '✓' : '·'}</span>{check.label}</li>)}
          </ul>
          {errors.password && <span className="field-error" id="signup-password-error">{errors.password}</span>}
        </div>

        <button className="button button-primary submit-button" type="submit" disabled={submitting}>
          {submitting ? <><span className="button-spinner" aria-hidden="true" /> Creating account…</> : <>Create account <span aria-hidden="true">↗</span></>}
        </button>
      </form>
      <p className="form-legal">By continuing, you agree to keep your account details private and secure.</p>
      <p className="mobile-switch">Already have an account? <Link to="/signin">Sign in</Link></p>
    </AuthFrame>
  );
}
