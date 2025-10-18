import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/features/login/Login';
import Order from '@/features/order/Order';
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
          <Route index element={<Navigate to="order" replace />} />
          <Route path="order" element={<Order />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/checkout" replace />} />
    </Routes>
  );
}
