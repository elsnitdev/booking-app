import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Edit3,
  ShieldCheck,
  Sparkles,
  MapPin,
  Monitor,
  Presentation,
  Video,
  Wifi,
  X,
  Check
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

// Interface cho Phòng họp
export interface AdminRoom {
  id: string;
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
  isActive: boolean;
}

// Interface cho Lịch đặt
export interface AdminBooking {
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
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
}

// Interface cho Doanh nghiệp
export interface CorporateClient {
  id: string;
  companyName: string;
  email: string;
  department: string;
  tier: 'Diamond Corporate' | 'Gold Partner' | 'Standard Business';
  totalMeetings: number;
  totalSpent: number;
  joinedDate: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'rooms' | 'clients'>('overview');

  // State thông báo Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ================= 1. STATE & DATA QUẢN LÝ PHÒNG HỌP =================
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<AdminRoom | null>(null);

  // Form State cho Phòng họp
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Executive Boardroom');
  const [formCapacity, setFormCapacity] = useState(12);
  const [formRate, setFormRate] = useState(350000);
  const [formLocation, setFormLocation] = useState('Tầng 18, Tòa tháp Bitexco, Q.1, TP.HCM');
  const [formProjector, setFormProjector] = useState(true);
  const [formWhiteboard, setFormWhiteboard] = useState(true);
  const [formVideo, setFormVideo] = useState(true);

  // Tải phòng từ API thực hoặc LocalStorage fallback
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Rooms`);
        const data = await res.json();
        if (res.ok && data.data && data.data.length > 0) {
          const mapped: AdminRoom[] = data.data.map((r: any) => ({
            id: r.id,
            name: r.name,
            capacity: r.capacity || 10,
            roomType: r.roomType || 'Executive Boardroom',
            hourlyRate: r.hourlyRate || 300000,
            location: r.location || 'Tòa nhà văn phòng',
            hasProjector: r.hasProjector ?? true,
            hasWhiteboard: r.hasWhiteboard ?? true,
            hasVideoConference: r.hasVideoConference ?? false,
            isActive: r.isActive ?? true
          }));
          setRooms(mapped);
        } else {
          loadDefaultRooms();
        }
      } catch (err) {
        loadDefaultRooms();
      }
    };

    const loadDefaultRooms = () => {
      const stored = localStorage.getItem('admin_rooms_state');
      if (stored) {
        setRooms(JSON.parse(stored));
      } else {
        const defaults: AdminRoom[] = [
          {
            id: 'room-1',
            name: 'Phòng Họp Hội Đồng VIP 1',
            capacity: 20,
            roomType: 'Executive Boardroom',
            hourlyRate: 500000,
            location: 'Tầng 25, Landmark 81, Bình Thạnh, TP.HCM',
            hasProjector: true,
            hasWhiteboard: true,
            hasVideoConference: true,
            isActive: true
          },
          {
            id: 'room-2',
            name: 'Workshop Studio Sáng Tạo',
            capacity: 35,
            roomType: 'Workshop Studio',
            hourlyRate: 450000,
            location: 'Tầng 12, Saigon Centre, Q.1, TP.HCM',
            hasProjector: true,
            hasWhiteboard: true,
            hasVideoConference: true,
            isActive: true
          },
          {
            id: 'room-3',
            name: 'Phòng Họp Chiến Lược Alpha',
            capacity: 12,
            roomType: 'Strategy Room',
            hourlyRate: 350000,
            location: 'Tầng 8, Bitexco Financial Tower, Q.1, TP.HCM',
            hasProjector: true,
            hasWhiteboard: true,
            hasVideoConference: false,
            isActive: true
          },
          {
            id: 'room-4',
            name: 'Phòng Thảo Luận & Đào Tạo B',
            capacity: 15,
            roomType: 'Creative Space',
            hourlyRate: 300000,
            location: 'Tầng 5, Keangnam Landmark 72, Cầu Giấy, Hà Nội',
            hasProjector: true,
            hasWhiteboard: true,
            hasVideoConference: false,
            isActive: true
          }
        ];
        setRooms(defaults);
      }
    };

    fetchRooms();
  }, []);

  const openAddRoomModal = () => {
    setEditingRoom(null);
    setFormName('');
    setFormType('Executive Boardroom');
    setFormCapacity(16);
    setFormRate(400000);
    setFormLocation('Tầng 15, Keangnam Landmark, Hà Nội');
    setFormProjector(true);
    setFormWhiteboard(true);
    setFormVideo(true);
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room: AdminRoom) => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormType(room.roomType);
    setFormCapacity(room.capacity);
    setFormRate(room.hourlyRate);
    setFormLocation(room.location);
    setFormProjector(room.hasProjector);
    setFormWhiteboard(room.hasWhiteboard);
    setFormVideo(room.hasVideoConference);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    if (editingRoom) {
      const updated = rooms.map(r => r.id === editingRoom.id ? {
        ...r,
        name: formName,
        roomType: formType,
        capacity: Number(formCapacity),
        hourlyRate: Number(formRate),
        location: formLocation,
        hasProjector: formProjector,
        hasWhiteboard: formWhiteboard,
        hasVideoConference: formVideo
      } : r);
      setRooms(updated);
      localStorage.setItem('admin_rooms_state', JSON.stringify(updated));
      showToast(`Đã cập nhật thông tin "${formName}" thành công!`);
    } else {
      const newRoom: AdminRoom = {
        id: `room-${Date.now()}`,
        name: formName,
        roomType: formType,
        capacity: Number(formCapacity),
        hourlyRate: Number(formRate),
        location: formLocation,
        hasProjector: formProjector,
        hasWhiteboard: formWhiteboard,
        hasVideoConference: formVideo,
        isActive: true
      };
      const updated = [newRoom, ...rooms];
      setRooms(updated);
      localStorage.setItem('admin_rooms_state', JSON.stringify(updated));
      showToast(`Đã tạo mới không gian "${formName}" thành công!`);
    }
    setIsRoomModalOpen(false);
  };

  const handleToggleRoomStatus = (roomId: string) => {
    const updated = rooms.map(r => r.id === roomId ? { ...r, isActive: !r.isActive } : r);
    setRooms(updated);
    localStorage.setItem('admin_rooms_state', JSON.stringify(updated));
    showToast('Đã thay đổi trạng thái khả dụng của phòng họp.');
  };

  // ================= 2. STATE & DATA QUẢN LÝ LỊCH ĐẶT =================
  const initialBookings: AdminBooking[] = [
    {
      id: 'BK-8901',
      title: 'Họp Chiến Lược Mở Rộng Thị Trường Q4',
      companyName: 'Vietjet Aviation JSC',
      contactEmail: 'tinsle0609@gmail.com',
      roomName: 'Phòng Họp Hội Đồng VIP 1',
      roomType: 'Executive Boardroom',
      date: '18/09/2026',
      startTime: '09:00',
      endTime: '12:00',
      participantCount: 16,
      totalPrice: 1500000,
      status: 'Confirmed'
    },
    {
      id: 'BK-8902',
      title: 'Workshop Thiết Kế Hệ Thống AI 2026',
      companyName: 'FPT Software Global',
      contactEmail: 'contact@fpt.com',
      roomName: 'Workshop Studio Sáng Tạo',
      roomType: 'Workshop Studio',
      date: '19/09/2026',
      startTime: '13:30',
      endTime: '17:30',
      participantCount: 28,
      totalPrice: 1800000,
      status: 'Confirmed'
    },
    {
      id: 'BK-8903',
      title: 'Ký Kết Hợp Đồng Đối Tác Chiến Lược',
      companyName: 'Vingroup Holding',
      contactEmail: 'admin@vingroup.net',
      roomName: 'Phòng Họp Chiến Lược Alpha',
      roomType: 'Strategy Room',
      date: '20/09/2026',
      startTime: '10:00',
      endTime: '12:00',
      participantCount: 10,
      totalPrice: 700000,
      status: 'Pending'
    },
    {
      id: 'BK-8898',
      title: 'Báo Cáo Tài Chính Hợp Nhất Q3',
      companyName: 'Techcombank Securities',
      contactEmail: 'board@tcbs.com.vn',
      roomName: 'Phòng Họp Hội Đồng VIP 1',
      roomType: 'Executive Boardroom',
      date: '15/09/2026',
      startTime: '14:00',
      endTime: '18:00',
      participantCount: 18,
      totalPrice: 2000000,
      status: 'Completed'
    },
    {
      id: 'BK-8895',
      title: 'Phỏng Vấn Quản Lý Khối Kinh Doanh',
      companyName: 'Masan Consumer',
      contactEmail: 'hr@masan.vn',
      roomName: 'Phòng Thảo Luận & Đào Tạo B',
      roomType: 'Creative Space',
      date: '14/09/2026',
      startTime: '08:30',
      endTime: '11:30',
      participantCount: 6,
      totalPrice: 900000,
      status: 'Cancelled'
    }
  ];

  const [bookings, setBookings] = useState<AdminBooking[]>(() => {
    const saved = localStorage.getItem('admin_bookings_state');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [bookingFilter, setBookingFilter] = useState<'all' | 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  const handleUpdateBookingStatus = (bookingId: string, newStatus: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled') => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    setBookings(updated);
    localStorage.setItem('admin_bookings_state', JSON.stringify(updated));
    showToast(`Đã cập nhật trạng thái lịch ${bookingId} sang "${newStatus}".`);
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = bookingFilter === 'all' || b.status === bookingFilter;
    const matchesSearch = b.title.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.companyName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.roomName.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ================= 3. STATE & DATA DOANH NGHIỆP =================
  const clients: CorporateClient[] = [
    {
      id: 'CLI-01',
      companyName: 'Vietjet Aviation JSC',
      email: 'tinsle0609@gmail.com',
      department: 'Khối Kế Hoạch & Đầu Tư',
      tier: 'Diamond Corporate',
      totalMeetings: 14,
      totalSpent: 18500000,
      joinedDate: '12/08/2025'
    },
    {
      id: 'CLI-02',
      companyName: 'FPT Software Global',
      email: 'contact@fpt.com',
      department: 'Trung Tâm Nghiên Cứu AI',
      tier: 'Diamond Corporate',
      totalMeetings: 22,
      totalSpent: 31200000,
      joinedDate: '05/06/2025'
    },
    {
      id: 'CLI-03',
      companyName: 'Vingroup Holding',
      email: 'admin@vingroup.net',
      department: 'Ban Thư Ký HĐQT',
      tier: 'Gold Partner',
      totalMeetings: 9,
      totalSpent: 12400000,
      joinedDate: '20/11/2025'
    },
    {
      id: 'CLI-04',
      companyName: 'Techcombank Securities',
      email: 'board@tcbs.com.vn',
      department: 'Khối Đầu Tư & Phân Tích',
      tier: 'Gold Partner',
      totalMeetings: 11,
      totalSpent: 15800000,
      joinedDate: '14/01/2026'
    },
    {
      id: 'CLI-05',
      companyName: 'Masan Consumer',
      email: 'hr@masan.vn',
      department: 'Nhân Sự & Đào Tạo',
      tier: 'Standard Business',
      totalMeetings: 5,
      totalSpent: 6200000,
      joinedDate: '02/03/2026'
    }
  ];

  // ================= 4. TÍNH TOÁN METRICS TỔNG QUAN =================
  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((sum, b) => sum + b.totalPrice, 0) + 124800000;

  const totalMeetingsCount = bookings.length + 42;
  const activeRoomsCount = rooms.filter(r => r.isActive).length;
  const corporateClientsCount = clients.length + 8;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 pb-20">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1220] text-[#e6c87e] border border-[#c59b48]/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-medium">
          <CheckCircle2 size={16} className="text-[#c59b48]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Banner */}
      <div className="bg-[#0b1220] text-white border-b border-[#c59b48]/25 pt-8 pb-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-[#c59b48]/20 text-[#e6c87e] border border-[#c59b48]/30">
                  <ShieldCheck size={12} className="text-[#c59b48]" />
                  Executive Control Console
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Hệ thống ổn định
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-normal text-stone-100 tracking-tight">
                Bảng Điều Khiển <span className="italic text-[#c59b48]">Quản Trị Viên</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 font-light mt-1">
                Theo dõi hiệu suất vận hành, giám sát lịch họp doanh nghiệp và quản lý không gian hội thảo.
              </p>
            </div>

            {/* Nút hành động nhanh */}
            <div className="flex items-center gap-3">
              <button
                onClick={openAddRoomModal}
                className="inline-flex items-center gap-2 bg-[#c59b48] hover:bg-[#b88e38] text-[#0b1220] px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
              >
                <Plus size={15} />
                <span>Thêm Không Gian Mới</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <div className="flex flex-wrap gap-2 mt-8 border-t border-stone-800/80 pt-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#c59b48] text-[#0b1220] font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Tổng Quan & KPI</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#c59b48] text-[#0b1220] font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Calendar size={14} />
              <span>Quản Lý Lịch Đặt ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'rooms'
                  ? 'bg-[#c59b48] text-[#0b1220] font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Building2 size={14} />
              <span>Danh Mục Phòng ({rooms.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-[#c59b48] text-[#0b1220] font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Users size={14} />
              <span>Doanh Nghiệp Thành Viên ({clients.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-6xl px-4 mt-8">

        {/* ======================= TAB 1: TỔNG QUAN & KPI ======================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Thẻ KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Thẻ 1: Doanh thu */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Tổng Doanh Thu
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#c59b48]/10 text-[#c59b48] flex items-center justify-center">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-stone-900 tracking-tight font-sans">
                    {totalRevenue.toLocaleString('vi-VN')}đ
                  </h3>
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp size={12} /> +18.4% so với tháng trước
                  </p>
                </div>
              </div>

              {/* Thẻ 2: Tổng cuộc họp */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Cuộc Họp Đã Đặt
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-stone-900 tracking-tight font-sans">
                    {totalMeetingsCount} phiên họp
                  </h3>
                  <p className="text-[11px] text-stone-500 font-light mt-1">
                    12 lịch họp diễn ra trong tuần này
                  </p>
                </div>
              </div>

              {/* Thẻ 3: Không gian sẵn sàng */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Không Gian Sẵn Sàng
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-stone-900 tracking-tight font-sans">
                    {activeRoomsCount} / {rooms.length} phòng
                  </h3>
                  <p className="text-[11px] text-stone-500 font-light mt-1">
                    Tỷ lệ lấp đầy đạt 78.5%
                  </p>
                </div>
              </div>

              {/* Thẻ 4: Khách hàng đối tác */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Doanh Nghiệp Đối Tác
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-stone-900 tracking-tight font-sans">
                    {corporateClientsCount} pháp nhân
                  </h3>
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <Sparkles size={12} /> +3 đối tác mới trong tháng
                  </p>
                </div>
              </div>
            </div>

            {/* Bảng phân bổ & Hoạt động gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cột trái: Hoạt động gần đây */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
                      Thời Gian Thực
                    </span>
                    <h3 className="text-lg font-serif font-normal text-stone-900">
                      Lịch Đặt Phòng Gần Nhất
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-medium text-[#a67c2e] hover:text-[#c59b48] transition cursor-pointer"
                  >
                    Xem tất cả →
                  </button>
                </div>

                <div className="space-y-3">
                  {bookings.slice(0, 4).map(b => (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-stone-50/70 border border-stone-100 gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-stone-900">{b.title}</span>
                          <span className="text-[10px] bg-stone-200/70 text-stone-700 px-2 py-0.5 rounded font-medium">
                            {b.id}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 flex flex-wrap items-center gap-3 font-light">
                          <span>🏢 {b.companyName}</span>
                          <span>🚪 {b.roomName}</span>
                          <span>🕒 {b.date} ({b.startTime} - {b.endTime})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className="text-xs font-semibold text-stone-900">
                          {b.totalPrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : b.status === 'Completed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-stone-100 text-stone-500 border border-stone-200'
                          }`}
                        >
                          {b.status === 'Confirmed' ? 'Đã duyệt' : b.status === 'Pending' ? 'Chờ duyệt' : b.status === 'Completed' ? 'Hoàn tất' : 'Đã hủy'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột phải: Tiêu chuẩn dịch vụ & Trạng thái phòng */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block mb-1">
                    Công Suất Không Gian
                  </span>
                  <h3 className="text-lg font-serif font-normal text-stone-900 mb-4">
                    Tình Trạng Phòng Hôm Nay
                  </h3>

                  <div className="space-y-4">
                    {rooms.map(room => (
                      <div key={room.id} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-stone-800 truncate">{room.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${room.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            {room.isActive ? 'Khả dụng' : 'Bảo trì'}
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#c59b48] h-full rounded-full transition-all duration-500"
                            style={{ width: room.isActive ? `${Math.min(95, (room.capacity / 35) * 100)}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/70 text-xs text-stone-600 space-y-1">
                    <p className="font-medium text-stone-800">Chu kỳ vệ sinh & Setup</p>
                    <p className="text-[11px] text-stone-500 font-light">
                      Mỗi phòng tự động kích hoạt 15 phút dọn dẹp và nạp pantry giữa 2 ca họp liên tiếp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: QUẢN LÝ LỊCH ĐẶT ======================= */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            {/* Header và Bộ lọc */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
                  Cơ Sở Dữ Liệu Lịch Họp
                </span>
                <h2 className="text-2xl font-serif font-normal text-stone-900">
                  Toàn Bộ Lịch Đặt Của Doanh Nghiệp
                </h2>
              </div>

              {/* Tìm kiếm & Lọc */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo cuộc họp, công ty, phòng..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#c59b48] w-64 text-stone-800 transition"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-medium">
                  {(['all', 'Confirmed', 'Pending', 'Completed', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setBookingFilter(st)}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                        bookingFilter === st
                          ? 'bg-white text-stone-900 shadow-xs font-semibold'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {st === 'all' ? 'Tất cả' : st === 'Confirmed' ? 'Đã duyệt' : st === 'Pending' ? 'Chờ duyệt' : st === 'Completed' ? 'Hoàn tất' : 'Đã hủy'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px] font-semibold">
                    <th className="pb-3 pr-4">Mã Đặt</th>
                    <th className="pb-3 pr-4">Cuộc Họp & Khách Hàng</th>
                    <th className="pb-3 pr-4">Không Gian</th>
                    <th className="pb-3 pr-4">Thời Gian</th>
                    <th className="pb-3 pr-4">Quy Mô</th>
                    <th className="pb-3 pr-4">Doanh Thu</th>
                    <th className="pb-3 pr-4">Trạng Thái</th>
                    <th className="pb-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        Không tìm thấy lịch đặt nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-3.5 pr-4 font-mono font-medium text-stone-600">
                          {b.id}
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="font-semibold text-stone-900">{b.title}</div>
                          <div className="text-stone-500 text-[11px] font-light flex items-center gap-1 mt-0.5">
                            <span>{b.companyName}</span>
                            <span className="text-stone-300">•</span>
                            <span>{b.contactEmail}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 font-medium text-stone-800">
                          {b.roomName}
                          <span className="block text-[10px] text-stone-400 font-light">{b.roomType}</span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="font-medium text-stone-800">{b.date}</div>
                          <div className="text-stone-400 text-[11px] font-light">{b.startTime} - {b.endTime}</div>
                        </td>
                        <td className="py-3.5 pr-4 font-medium text-stone-700">
                          {b.participantCount} người
                        </td>
                        <td className="py-3.5 pr-4 font-semibold text-stone-900 font-sans">
                          {b.totalPrice.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-3.5 pr-4">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full inline-block ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : b.status === 'Pending'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : b.status === 'Completed'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            {b.status === 'Confirmed' ? 'Đã duyệt' : b.status === 'Pending' ? 'Chờ xử lý' : b.status === 'Completed' ? 'Đã hoàn tất' : 'Đã hủy'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {b.status !== 'Confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                title="Xác nhận lịch họp"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                              >
                                <Check size={13} />
                              </button>
                            )}
                            {b.status !== 'Completed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                                title="Đánh dấu đã hoàn tất"
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                              >
                                <Clock size={13} />
                              </button>
                            )}
                            {b.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                                title="Hủy lịch họp"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: QUẢN LÝ PHÒNG HỌP ======================= */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
                  Danh Mục Tài Sản
                </span>
                <h2 className="text-2xl font-serif font-normal text-stone-900">
                  Quản Lý Hệ Thống Không Gian Họp
                </h2>
              </div>
              <button
                onClick={openAddRoomModal}
                className="inline-flex items-center gap-2 bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] self-start sm:self-auto cursor-pointer"
              >
                <Plus size={15} />
                <span>Thêm Không Gian Mới</span>
              </button>
            </div>

            {/* Lưới danh sách phòng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className={`bg-white rounded-2xl border p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition flex flex-col justify-between ${
                    room.isActive ? 'border-stone-200/90' : 'border-stone-200 opacity-60 bg-stone-50/50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-[#a67c2e] bg-[#c59b48]/10 px-2.5 py-0.5 rounded-full border border-[#c59b48]/20">
                          {room.roomType}
                        </span>
                        <h3 className="text-xl font-serif font-normal text-stone-900 mt-2">
                          {room.name}
                        </h3>
                      </div>
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${room.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-200 text-stone-600'}`}>
                        {room.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 flex items-center gap-1.5 font-light mb-4">
                      <MapPin size={13} className="text-[#c59b48] shrink-0" />
                      <span>{room.location}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-stone-100 text-xs mb-4">
                      <div>
                        <span className="text-[10px] uppercase text-stone-400 font-semibold block">Sức Chứa</span>
                        <span className="font-semibold text-stone-800">{room.capacity} thành viên</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-stone-400 font-semibold block">Giá Thuê / Giờ</span>
                        <span className="font-semibold text-stone-800">{Number(room.hourlyRate).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>

                    {/* Tiện ích có sẵn */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {room.hasProjector && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-stone-50 text-stone-600 px-2.5 py-1 rounded-lg border border-stone-200/60 font-medium">
                          <Monitor size={12} className="text-indigo-600" /> Màn chiếu LED
                        </span>
                      )}
                      {room.hasWhiteboard && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-stone-50 text-stone-600 px-2.5 py-1 rounded-lg border border-stone-200/60 font-medium">
                          <Presentation size={12} className="text-indigo-600" /> Bảng viết
                        </span>
                      )}
                      {room.hasVideoConference && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-stone-50 text-stone-600 px-2.5 py-1 rounded-lg border border-stone-200/60 font-medium">
                          <Video size={12} className="text-indigo-600" /> Zoom/Teams
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] bg-stone-50 text-stone-600 px-2.5 py-1 rounded-lg border border-stone-200/60 font-medium">
                        <Wifi size={12} className="text-indigo-600" /> 1Gbps Wifi
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                    <button
                      onClick={() => handleToggleRoomStatus(room.id)}
                      className="text-xs text-stone-500 hover:text-stone-800 transition cursor-pointer font-medium"
                    >
                      {room.isActive ? 'Tạm ngưng phục vụ' : 'Kích hoạt lại'}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditRoomModal(room)}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-100 hover:bg-[#c59b48] hover:text-[#0b1220] text-stone-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <Edit3 size={13} /> Sửa
                      </button>
                      <Link
                        to={`/room/${room.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-900 px-2 py-1.5 transition"
                      >
                        Xem trang khách
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 4: DOANH NGHIỆP THÀNH VIÊN ======================= */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="mb-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
                Mạng Lưới Khách Hàng
              </span>
              <h2 className="text-2xl font-serif font-normal text-stone-900">
                Tài Khoản Doanh Nghiệp Đối Tác
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 font-light">
                Danh sách các tập đoàn, doanh nghiệp đã kích hoạt tài khoản hội viên trên Alpha Workplace.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px] font-semibold">
                    <th className="pb-3 pr-4">Mã Đối Tác</th>
                    <th className="pb-3 pr-4">Doanh Nghiệp / Email</th>
                    <th className="pb-3 pr-4">Khối / Phòng Ban</th>
                    <th className="pb-3 pr-4">Cấp Hội Viên</th>
                    <th className="pb-3 pr-4">Số Phiên Họp</th>
                    <th className="pb-3 pr-4">Tổng Chi Tiêu</th>
                    <th className="pb-3 text-right">Ngày Tham Gia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {clients.map(c => (
                    <tr key={c.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 pr-4 font-mono font-medium text-stone-600">
                        {c.id}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-stone-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#0b1220] text-[#c59b48] flex items-center justify-center font-serif text-xs">
                            {c.companyName.charAt(0)}
                          </div>
                          <span>{c.companyName}</span>
                        </div>
                        <div className="text-stone-400 text-[11px] font-light pl-9 mt-0.5">
                          {c.email}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-stone-700">
                        {c.department}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                          c.tier === 'Diamond Corporate'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : c.tier === 'Gold Partner'
                            ? 'bg-stone-100 text-stone-800 border border-stone-300'
                            : 'bg-stone-50 text-stone-600 border border-stone-200'
                        }`}>
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-stone-900">
                        {c.totalMeetings} cuộc họp
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-stone-900 font-sans">
                        {c.totalSpent.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-3.5 text-right font-light text-stone-500">
                        {c.joinedDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ======================= MODAL THÊM / SỬA PHÒNG HỌP ======================= */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <span className="text-[10px] uppercase font-semibold tracking-[0.16em] text-[#a67c2e] block">
                {editingRoom ? 'Chỉnh Sửa Thông Tin' : 'Khởi Tạo Không Gian'}
              </span>
              <h3 className="text-xl font-serif font-normal text-stone-900">
                {editingRoom ? `Sửa Không Gian: ${editingRoom.name}` : 'Thêm Phòng Họp & Workshop Mới'}
              </h3>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Tên phòng họp</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: Phòng Hội Thảo Boardroom Alpha 2"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c59b48] text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Loại không gian</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#c59b48] text-stone-800 cursor-pointer"
                  >
                    <option value="Executive Boardroom">Executive Boardroom (VIP)</option>
                    <option value="Workshop Studio">Workshop Studio (Sáng tạo)</option>
                    <option value="Strategy Room">Strategy Room (Chiến lược)</option>
                    <option value="Creative Space">Creative Space (Thảo luận)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Sức chứa tối đa (người)</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c59b48] text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Giá thuê niêm yết (VNĐ / giờ)</label>
                  <input
                    type="number"
                    step="50000"
                    min="100000"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c59b48] text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Vị trí phòng / Tầng</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Tầng 15, Keangnam Landmark"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c59b48] text-stone-800"
                  />
                </div>
              </div>

              {/* Checkboxes tiện ích */}
              <div className="pt-2">
                <span className="block text-stone-700 font-medium mb-2">Trang thiết bị & Tiện nghi đi kèm</span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formProjector}
                      onChange={(e) => setFormProjector(e.target.checked)}
                      className="accent-[#c59b48] w-4 h-4 rounded"
                    />
                    <span>Màn chiếu LED 4K / Máy chiếu siêu nét</span>
                  </label>

                  <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formWhiteboard}
                      onChange={(e) => setFormWhiteboard(e.target.checked)}
                      className="accent-[#c59b48] w-4 h-4 rounded"
                    />
                    <span>Bảng kính & Bút dạ thảo luận chuyên dụng</span>
                  </label>

                  <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formVideo}
                      onChange={(e) => setFormVideo(e.target.checked)}
                      className="accent-[#c59b48] w-4 h-4 rounded"
                    />
                    <span>Hệ thống Hội nghị truyền hình trực tuyến (Zoom/Teams Rooms)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition cursor-pointer font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white transition font-semibold cursor-pointer active:scale-98 shadow-sm"
                >
                  {editingRoom ? 'Lưu Thay Đổi' : 'Tạo Không Gian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
