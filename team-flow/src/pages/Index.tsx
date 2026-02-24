import { useApp } from '@/context/AppContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/landing" replace />;
};

export default Index;
