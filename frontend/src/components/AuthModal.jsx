import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal = () => {
  const {
    authModal,
    closeAuthModal,
    switchAuthMode,
  } = useAuth();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!authModal.isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAuthModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.querySelector('input')?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [authModal.isOpen, closeAuthModal]);

  useEffect(() => {
    if (authModal.isOpen) {
      dialogRef.current?.querySelector('input')?.focus();
    }
  }, [authModal.mode, authModal.isOpen]);

  if (!authModal.isOpen) {
    return null;
  }

  const isLogin = authModal.mode === 'login';
  const Form = isLogin ? LoginForm : RegisterForm;

  return (
    <div
      className="auth-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeAuthModal();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
      >
        <button
          type="button"
          className="auth-modal-close"
          aria-label="Close authentication dialog"
          onClick={closeAuthModal}
        >
          ×
        </button>
        <Form key={authModal.mode} onSuccess={closeAuthModal} />
        <p className="auth-footer auth-modal-footer">
          {isLogin ? (
            <>
              New here?{' '}
              <button type="button" onClick={switchAuthMode}>Sign Up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={switchAuthMode}>Login</button>
            </>
          )}
        </p>
      </section>
    </div>
  );
};

export default AuthModal;
