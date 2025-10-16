import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useSession } from '@/stores/session';

export default function ProtectedRoute() {
  const accessToken = useSession((state) => state.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
