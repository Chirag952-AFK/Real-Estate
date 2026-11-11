import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  clearToken,
  getCurrentUser,
  getToken,
  loginUser,
  registerUser,
  setToken,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setAuthToken] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (active) {
          setUser(response.user);
        }
      } catch {
        clearToken();
        if (active) {
          setAuthToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, [token]);

  const login = async (data) => {
    const response = await loginUser(data);
    setToken(response.token);
    setAuthToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (data) => {
    const response = await registerUser(data);
    setToken(response.token);
    setAuthToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    clearToken();
    setAuthToken(null);
    setUser(null);
  };

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModal({ isOpen: true, mode: mode === 'register' ? 'register' : 'login' });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((current) => ({ ...current, isOpen: false }));
  }, []);

  const switchAuthMode = useCallback(() => {
    setAuthModal((current) => ({
      ...current,
      mode: current.mode === 'login' ? 'register' : 'login',
    }));
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthToken(null);
      setUser(null);
      setLoading(false);
      openAuthModal('login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [openAuthModal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        authModal,
        openAuthModal,
        closeAuthModal,
        switchAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
