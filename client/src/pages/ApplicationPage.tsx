import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';

export function ApplicationPage() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();
  const initials = user?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'EG';

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    navigate('/signin', { replace: true });
  }

  return (
    <main className="app-page">
      <header className="app-header">
        <Link className="brand-lockup app-brand" to="/app"><span className="brand-mark">e</span><span>easygenerator</span></Link>
        <div className="account-actions">
          <div className="account-copy"><span className="account-name">{user?.name}</span><span className="account-email">{user?.email}</span></div>
          <span className="avatar" aria-hidden="true">{initials}</span>
          <button className="button button-quiet" onClick={() => void handleSignOut()} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <span className="eyebrow">YOUR SPACE IS READY</span>
          <h1 id="welcome-title">Welcome to the application.</h1>
          <p>It’s good to have you here, {user?.name.split(' ')[0]}. Your next great idea can start whenever you are.</p>
          <div className="welcome-meta"><span className="welcome-check" aria-hidden="true">✓</span><span>Signed in as <strong>{user?.email}</strong></span></div>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-sun" />
          <div className="art-orbit art-orbit-a" /><div className="art-orbit art-orbit-b" />
          <div className="art-card art-card-back"><span /><span /><span /></div>
          <div className="art-card art-card-front"><span className="art-card-icon">✳</span><span className="art-card-line" /><span className="art-card-line short" /><span className="art-card-progress"><i /></span></div>
          <span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✳</span>
        </div>
      </section>

      <footer className="app-footer"><span>Make space for what’s next.</span><span>Easygenerator · Your learning space</span></footer>
    </main>
  );
}
