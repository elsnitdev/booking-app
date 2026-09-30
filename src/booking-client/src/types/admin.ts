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

// Interface hình ảnh phòng
export interface AdminRoomImage {
  id: string;
  imageUrl: string;
  caption?: string;
  tag?: string;
  isPrimary: boolean;
  displayOrder: number;
}

// Interface tiện ích phòng
export interface AdminRoomAmenity {
  id: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
  customNote?: string;
  quantity: number;
}

// Interface danh mục tiện ích dùng chung
export interface AmenityItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
  isActive: boolean;
}

// Interface quản lý phòng
export interface AdminRoomItem {
  id: string;
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  description?: string;
  coverImageUrl?: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
  cleanupTimeMinutes?: number;
  isActive: boolean;
  images?: AdminRoomImage[];
  amenities?: AdminRoomAmenity[];
}

// Payload khi tạo mới hoặc cập nhật phòng
export interface RoomManagePayload {
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  description?: string;
  coverImageUrl?: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
  cleanupTimeMinutes?: number;
  isActive?: boolean;
  images?: Array<{
    id?: string;
    imageUrl: string;
    caption?: string;
    tag?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  }>;
  amenities?: Array<{
    amenityId: string;
    customNote?: string;
    quantity?: number;
  }>;
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
