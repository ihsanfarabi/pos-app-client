import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/features/login/Login';
import Settings from '@/features/settings/Settings';
import Tickets from '@/features/tickets/Tickets';
import Layout from './Layout';
import ProtectedRoute from './ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="tickets" replace />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
}
