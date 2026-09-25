import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Building2,
  Users,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import { adminRequest } from '../../requests/adminRequest';
import type { AdminDashboardStats, AdminRoomItem } from '../../types/admin';

const emptyStats: AdminDashboardStats = {
  totalRevenue: 0,
  totalBookings: 0,
  confirmedBookings: 0,
  pendingBookings: 0,
  completedBookings: 0,
  cancelledBookings: 0,
  totalRooms: 0,
  activeRooms: 0,
  totalCorporateUsers: 0,
  recentBookings: []
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [rooms, setRooms] = useState<AdminRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, roomsRes] = await Promise.allSettled([
        adminRequest.getStats(),
        adminRequest.getRooms(),
      ]);

      let hasValidStats = false;
      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data);
        hasValidStats = true;
        try {
          localStorage.setItem('admin_cached_stats', JSON.stringify(statsRes.value.data));
        } catch {
          // Bỏ qua lỗi localStorage
        }
      } else if (statsRes.status === 'rejected') {
        throw statsRes.reason;
      }

      if (roomsRes.status === 'fulfilled' && roomsRes.value.data) {
        setRooms(roomsRes.value.data);
        try {
          localStorage.setItem('admin_cached_rooms', JSON.stringify(roomsRes.value.data));
        } catch {
          // Bỏ qua lỗi localStorage
        }
      }

      if (hasValidStats) {
        setIsUsingCache(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải dữ liệu thống kê từ máy chủ.';
      setError(errorMsg);

      // Nếu mất mạng, thử khôi phục từ cache thực tế đã lưu trước đó
      const cachedStats = localStorage.getItem('admin_cached_stats');
      const cachedRooms = localStorage.getItem('admin_cached_rooms');

      let restoredCache = false;
      if (cachedStats) {
        try {
          const parsed = JSON.parse(cachedStats);
          if (parsed && typeof parsed.totalRevenue === 'number') {
            setStats(parsed);
            restoredCache = true;
          }
        } catch {
          // Bỏ qua lỗi parse
        }
      }

      if (cachedRooms) {
        try {
          const parsedRooms = JSON.parse(cachedRooms);
          if (Array.isArray(parsedRooms)) {
            setRooms(parsedRooms);
          }
        } catch {
          // Bỏ qua lỗi parse
        }
      }

      setIsUsingCache(restoredCache);
      if (!restoredCache) {
        setStats(emptyStats);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#c59b48] mb-3" />
        <p className="text-xs font-light">Đang nạp dữ liệu thống kê quản trị...</p>
      </div>
    );
  }

  const displayStats = stats || emptyStats;
  const isUnauthorized = error?.toLowerCase().includes('unauthorized') || error?.includes('401');

  return (
    <div className="space-y-8">
      {/* Thông báo khi đang dùng cache ngoại tuyến lúc mất mạng */}
      {isUsingCache && (
        <div className="bg-sky-50 border border-sky-200 text-sky-900 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <WifiOff size={15} className="text-sky-600 shrink-0" />
            <span>
              Mất kết nối máy chủ API. Đang hiển thị số liệu thống kê từ bộ nhớ đệm gần nhất.
            </span>
          </div>
          <button
            onClick={fetchOverviewData}
            className="font-semibold text-sky-900 hover:text-sky-950 underline self-end sm:self-auto shrink-0 cursor-pointer"
          >
            Thử kết nối lại
          </button>
        </div>
      )}

      {/* Thông báo lỗi khi không có cache */}
      {error && !isUsingCache && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>
              {isUnauthorized
                ? 'Phiên đăng nhập quản trị chưa được xác thực hoặc đã hết hạn (Unauthorized).'
                : `Không thể kết nối đến máy chủ API: ${error}.`}
            </span>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            {isUnauthorized && (
              <Link
                to="/login"
                className="font-semibold text-amber-900 hover:text-amber-950 underline"
              >
                Đăng nhập lại
              </Link>
            )}
            <button
              onClick={fetchOverviewData}
              className="flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
            >
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        </div>
      )}

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
              {Number(displayStats.totalRevenue).toLocaleString('vi-VN')}đ
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp size={12} /> Dữ liệu trực tiếp từ hệ thống
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
              {displayStats.totalBookings} phiên họp
            </h3>
            <p className="text-[11px] text-stone-500 font-light mt-1">
              {displayStats.confirmedBookings} đã duyệt • {displayStats.pendingBookings} chờ duyệt
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
              {displayStats.activeRooms} / {displayStats.totalRooms} phòng
            </h3>
            <p className="text-[11px] text-stone-500 font-light mt-1">
              Đang hoạt động trên hệ thống
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
              {displayStats.totalCorporateUsers} pháp nhân
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <Sparkles size={12} /> Tài khoản doanh nghiệp hội viên
            </p>
          </div>
        </div>
      </div>

      {/* Bảng phân bổ & Lịch họp gần nhất */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Lịch họp gần nhất */}
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
            <Link
              to="/admin/bookings"
              className="text-xs font-medium text-[#a67c2e] hover:text-[#c59b48] transition cursor-pointer"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {displayStats.recentBookings && displayStats.recentBookings.length > 0 ? (
              displayStats.recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-stone-50/70 border border-stone-100 gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-stone-900">{b.title}</span>
                      <span className="text-[10px] bg-stone-200/70 text-stone-700 px-2 py-0.5 rounded font-mono font-medium">
                        {b.id.length > 10 ? 'BK-' + b.id.substring(0, 6).toUpperCase() : b.id}
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
                      {Number(b.totalPrice).toLocaleString('vi-VN')}đ
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
                      {b.status === 'Confirmed'
                        ? 'Đã duyệt'
                        : b.status === 'Pending'
                        ? 'Chờ duyệt'
                        : b.status === 'Completed'
                        ? 'Hoàn tất'
                        : 'Đã hủy'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-stone-400">
                {error
                  ? 'Không thể tải lịch đặt phòng gần nhất khi mất kết nối mạng.'
                  : 'Chưa có lịch họp nào được ghi nhận gần đây.'}
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Tình trạng phòng hôm nay */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block mb-1">
              Công Suất Không Gian
            </span>
            <h3 className="text-lg font-serif font-normal text-stone-900 mb-4">
              Tình Trạng Phòng Hôm Nay
            </h3>

            <div className="space-y-4">
              {rooms.length > 0 ? (
                rooms.slice(0, 5).map((room) => (
                  <div key={room.id} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-stone-800 truncate">{room.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          room.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {room.isActive ? 'Khả dụng' : 'Bảo trì'}
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#c59b48] h-full rounded-full transition-all duration-500"
                        style={{
                          width: room.isActive ? `${Math.min(95, (room.capacity / 35) * 100)}%` : '0%',
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-stone-400 py-4 text-center">
                  {error ? 'Không thể tải tình trạng phòng khi mất mạng.' : 'Chưa có phòng họp nào trong hệ thống.'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/70 text-xs text-stone-600 space-y-1">
              <p className="font-medium text-stone-800">Chu kỳ vệ sinh & Setup tự động</p>
              <p className="text-[11px] text-stone-500 font-light">
                Mỗi phòng tự động kích hoạt 15 phút dọn dẹp và nạp pantry giữa 2 ca họp liên tiếp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
