import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/features/login/Login';
import Tickets from '@/features/tickets/Tickets';
import Layout from './Layout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="tickets" replace />} />
          <Route path="tickets" element={<Tickets />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
}
