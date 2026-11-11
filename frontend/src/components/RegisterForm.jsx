import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'user',
};

const RegisterForm = ({ onSuccess }) => {
  const { register } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Enter your name.');
      return;
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registrationData } = form;
      await register({
        ...registrationData,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
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
        <span className="auth-eyebrow">Get started</span>
        <h2 id="auth-modal-title">Create your account</h2>
        <p>Join to find a home or share your property with the right people.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="modal-register-name">Full name</label>
        <input
          id="modal-register-name"
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="modal-register-email">Email address</label>
        <input
          id="modal-register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="modal-register-phone">Phone <span>(optional)</span></label>
        <input
          id="modal-register-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
        />

        <label htmlFor="modal-register-role">I want to</label>
        <select id="modal-register-role" name="role" value={form.role} onChange={handleChange}>
          <option value="user">Buy or rent a property</option>
          <option value="agent">List properties</option>
        </select>

        <label htmlFor="modal-register-password">Password</label>
        <input
          id="modal-register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />

        <label htmlFor="modal-register-confirm-password">Confirm password</label>
        <input
          id="modal-register-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="primary-button auth-submit" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </>
  );
};

export default RegisterForm;
