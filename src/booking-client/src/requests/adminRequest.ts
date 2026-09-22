import { httpClient } from '../lib/httpClient';
import type {
  AdminDashboardStats,
  AdminBookingItem,
  AdminRoomItem,
  RoomManagePayload,
  CorporateUserItem,
} from '../types/admin';

export const adminRequest = {
  // 1. Thống kê tổng quan & KPI
  getStats: () =>
    httpClient.get<AdminDashboardStats>('/Admin/stats', { authenticated: true }),

  // 2. Lấy danh sách lịch đặt phòng (hỗ trợ lọc status và tìm kiếm search)
  getBookings: (params?: { status?: string; search?: string }) => {
    const queryParts: string[] = [];
    if (params?.status && params.status !== 'all') {
      queryParts.push(`status=${encodeURIComponent(params.status)}`);
    }
    if (params?.search && params.search.trim()) {
      queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
    }
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return httpClient.get<AdminBookingItem[]>(`/Admin/bookings${queryString}`, {
      authenticated: true,
    });
  },

  // Cập nhật trạng thái lịch họp (Confirmed | Pending | Completed | Cancelled)
  updateBookingStatus: (bookingRawId: string, status: string) =>
    httpClient.put<string>(
      `/Admin/bookings/${bookingRawId}/status`,
      { status },
      { authenticated: true }
    ),

  // 3. Quản lý danh mục phòng họp
  getRooms: () =>
    httpClient.get<AdminRoomItem[]>('/Admin/rooms', { authenticated: true }),

  // Tạo mới phòng họp
  createRoom: (payload: RoomManagePayload) =>
    httpClient.post<AdminRoomItem>('/Admin/rooms', payload, {
      authenticated: true,
    }),

  // Cập nhật thông tin phòng họp
  updateRoom: (roomId: string, payload: RoomManagePayload) =>
    httpClient.put<AdminRoomItem>(`/Admin/rooms/${roomId}`, payload, {
      authenticated: true,
    }),

  // Bật/tắt trạng thái hoạt động của phòng
  toggleRoomStatus: (roomId: string) =>
    httpClient.put<boolean>(
      `/Admin/rooms/${roomId}/toggle-status`,
      undefined,
      { authenticated: true }
    ),

  // 4. Lấy danh sách doanh nghiệp đối tác
  getCorporateUsers: () =>
    httpClient.get<CorporateUserItem[]>('/Admin/users', { authenticated: true }),
};
