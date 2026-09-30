import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface AuthFrameProps {
  children: ReactNode;
  mode: 'signin' | 'signup';
}

export function AuthFrame({ children, mode }: AuthFrameProps) {
  return (
    <div className="auth-layout">
      <aside className="brand-panel">
        <Link className="brand-lockup" to="/signin" aria-label="Easygenerator home">
          <span className="brand-mark">e</span>
          <span>easygenerator</span>
        </Link>
        <div className="brand-copy">
          <span className="eyebrow eyebrow-light">A little more room to grow</span>
          <h1>Make learning<br />feel effortless.</h1>
          <p>A calm, focused space to keep your work moving and your next idea close.</p>
        </div>
        <div className="learning-card" aria-hidden="true">
          <div className="learning-card-top"><span className="mini-mark">e</span><span className="live-dot" /> <span className="tiny-label">YOUR WORKSPACE</span></div>
          <div className="learning-card-title">A fresh start,<br />at your own pace.</div>
          <div className="learning-progress"><span /></div>
          <div className="learning-card-bottom"><span>Ready when you are</span><span className="arrow-mark">↗</span></div>
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
        </div>
        <div className="brand-footer"><span>Thoughtful learning starts here.</span><span>01 / 02</span></div>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel-top">
          <span className="auth-top-note">{mode === 'signup' ? 'Already a member?' : 'New around here?'}</span>
          <Link className="text-link" to={mode === 'signup' ? '/signin' : '/signup'}>
            {mode === 'signup' ? 'Sign in' : 'Create account'} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <section className="auth-content" aria-labelledby="form-title">{children}</section>
        <footer className="auth-footer"><span>© 2026 Easygenerator</span><span>Secure access · Private by design</span></footer>
      </main>
    </div>
  );
}
