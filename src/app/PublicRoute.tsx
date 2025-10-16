import type { Location } from 'react-router-dom';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useSession } from '@/stores/session';

type LocationState = {
  from?: Location;
};

export default function PublicRoute() {
  const accessToken = useSession((state) => state.accessToken);
  const location = useLocation();

  if (accessToken) {
    const from = (location.state as LocationState | undefined)?.from;
    return (
      <Navigate
        to={
          from ?? {
            pathname: '/tickets',
          }
        }
        replace
      />
    );
  }

  return <Outlet />;
}
