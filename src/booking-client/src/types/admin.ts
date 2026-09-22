// Interface cho lịch họp gần đây trong Dashboard Stats
export interface AdminRecentBooking {
  id: string;
  title: string;
  companyName: string;
  contactEmail: string;
  roomName: string;
  roomType: string;
  date: string;
  startTime: string;
  endTime: string;
  participantCount: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | string;
}

// Interface số liệu thống kê Dashboard
export interface AdminDashboardStats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRooms: number;
  activeRooms: number;
  totalCorporateUsers: number;
  recentBookings: AdminRecentBooking[];
}

// Interface cho một mục lịch đặt trong danh sách quản lý
export interface AdminBookingItem {
  id: string;
  rawId: string;
  title: string;
  companyName: string;
  contactEmail: string;
  roomName: string;
  roomType: string;
  date: string;
  startTime: string;
  endTime: string;
  participantCount: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  createdAt?: string;
}

// Interface quản lý phòng
export interface AdminRoomItem {
  id: string;
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
  cleanupTimeMinutes?: number;
  isActive: boolean;
}

// Payload khi tạo mới hoặc cập nhật phòng
export interface RoomManagePayload {
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
  cleanupTimeMinutes?: number;
  isActive?: boolean;
}

// Interface cho Doanh nghiệp đối tác
export interface CorporateUserItem {
  id: string;
  username: string;
  email: string;
  companyName: string;
  department: string;
  role: string;
  totalMeetings: number;
  totalSpent: number;
  tier?: 'Diamond Corporate' | 'Gold Partner' | 'Standard Business';
}
