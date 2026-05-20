import { observer } from 'mobx-react-lite';
import { Navigate } from 'react-router-dom';
import { useStore } from '../models/StoreContext';

export default observer(function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useStore();
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
});
