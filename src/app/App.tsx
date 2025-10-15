import { Route, Routes } from 'react-router-dom';
import Login from '@/features/login/Login';
import Settings from '@/features/settings/Settings';
import Tickets from '@/features/tickets/Tickets';
import Checkout from '@/features/checkout/Checkout';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/tickets" element={<Tickets />} />
    </Routes>
  );
}
