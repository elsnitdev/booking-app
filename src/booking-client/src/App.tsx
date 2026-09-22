import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomDetailPage from './pages/RoomDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';
import { lazy } from 'react';
import AdminLayout from './pages/admin/AdminLayout';

const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminRoomsPage = lazy(() => import('./pages/admin/AdminRoomsPage'));
const AdminClientsPage = lazy(() => import('./pages/admin/AdminClientsPage'));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/room/:id" element={<RoomDetailPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/profile" element={<MyBookingsPage />} />
        
        {/* Tuyến đường phân trang cho Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="clients" element={<AdminClientsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
