/**
 * File này đã được tái cấu trúc và tách nhỏ thành các trang chuyên biệt theo React Router v7:
 * - AdminLayout: src/pages/admin/AdminLayout.tsx
 * - AdminOverviewPage: src/pages/admin/AdminOverviewPage.tsx (/admin)
 * - AdminBookingsPage: src/pages/admin/AdminBookingsPage.tsx (/admin/bookings)
 * - AdminRoomsPage: src/pages/admin/AdminRoomsPage.tsx (/admin/rooms)
 * - AdminClientsPage: src/pages/admin/AdminClientsPage.tsx (/admin/clients)
 */

export { default } from './admin/AdminLayout';
export type { AdminBookingItem as AdminBooking, AdminRoomItem as AdminRoom } from '../types/admin';
