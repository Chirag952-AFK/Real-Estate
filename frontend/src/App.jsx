import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';

const AuthRedirect = ({ mode }) => {
  const { openAuthModal } = useAuth();

  useEffect(() => {
    openAuthModal(mode);
  }, [mode, openAuthModal]);

  return <Navigate to="/" replace />;
};

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthRedirect mode="login" />} />
      <Route path="/register" element={<AuthRedirect mode="register" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <AuthModal />
  </>
);

export default App;
