import { Navigate, Route, Routes } from 'react-router-dom';
import Checkout from '@/features/checkout/Checkout';
import Login from '@/features/login/Login';
import Sell from '@/features/sell/Sell';
import Settings from '@/features/settings/Settings';
import Tickets from '@/features/tickets/Tickets';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sell" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/sell" element={<Sell />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/tickets" element={<Tickets />} />
    </Routes>
  );
}
