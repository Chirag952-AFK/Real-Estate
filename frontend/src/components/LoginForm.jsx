import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL_FORM = { email: '', password: '' };

const LoginForm = ({ onSuccess }) => {
  const { login } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      setForm(INITIAL_FORM);
      setError('');
      onSuccess();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-heading">
        <span className="auth-eyebrow">Welcome back</span>
        <h2 id="auth-modal-title">Sign in to your account</h2>
        <p>Pick up where you left off and find your next place.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="modal-login-email">Email address</label>
        <input
          id="modal-login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="modal-login-password">Password</label>
        <input
          id="modal-login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="primary-button auth-submit" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </>
  );
};

export default LoginForm;
