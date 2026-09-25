import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Check,
  Clock,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import { adminRequest } from '../../requests/adminRequest';
import type { AdminBookingItem } from '../../types/admin';
import { useAdminToast } from '../../context/AdminToastContext';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useAdminToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminRequest.getBookings({
        status: bookingFilter,
        search: bookingSearch,
      });
      if (res.data) {
        setBookings(res.data);
        setIsUsingCache(false);
        // Lưu cache khi gọi API thành công để dùng khi mất mạng
        try {
          localStorage.setItem('admin_cached_bookings', JSON.stringify(res.data));
        } catch {
          // Bỏ qua lỗi localStorage
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải danh sách lịch đặt.';
      setError(errorMsg);

      // Nếu mất mạng hoặc lỗi máy chủ, thử lấy từ cache thật đã lưu trước đó
      const cached = localStorage.getItem('admin_cached_bookings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBookings(parsed);
            setIsUsingCache(true);
            return;
          }
        } catch {
          // Bỏ qua lỗi parse
        }
      }
      // Nếu không có cache, để danh sách rỗng (không dùng mock data)
      setBookings([]);
      setIsUsingCache(false);
    } finally {
      setLoading(false);
    }
  }, [bookingFilter, bookingSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  const handleUpdateStatus = async (
    booking: AdminBookingItem,
    newStatus: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
  ) => {
    setUpdatingId(booking.rawId || booking.id);
    try {
      await adminRequest.updateBookingStatus(booking.rawId || booking.id, newStatus);
      showToast(`Đã cập nhật trạng thái lịch ${booking.id} sang "${newStatus}".`, 'success');

      setBookings((prev) => {
        const updated = prev.map((b) => (b.id === booking.id ? { ...b, status: newStatus } : b));
        try {
          localStorage.setItem('admin_cached_bookings', JSON.stringify(updated));
        } catch {
          // Bỏ qua
        }
        return updated;
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái.';
      showToast(`Không thể cập nhật trạng thái khi mất kết nối mạng: ${errorMsg}`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const isUnauthorized = error?.toLowerCase().includes('unauthorized') || error?.includes('401');

  return (
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
          <p className="text-xs text-stone-500 mt-0.5 font-light">
            Duyệt lịch họp, xác nhận phòng và giám sát thời gian diễn ra của các đối tác.
          </p>
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
                {st === 'all'
                  ? 'Tất cả'
                  : st === 'Confirmed'
                  ? 'Đã duyệt'
                  : st === 'Pending'
                  ? 'Chờ duyệt'
                  : st === 'Completed'
                  ? 'Hoàn tất'
                  : 'Đã hủy'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchBookings}
            title="Tải lại danh sách"
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Thông báo khi đang dùng cache ngoại tuyến lúc mất mạng */}
      {isUsingCache && (
        <div className="mb-4 bg-sky-50 border border-sky-200 text-sky-900 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <WifiOff size={15} className="text-sky-600 shrink-0" />
            <span>
              Mất kết nối máy chủ API. Đang hiển thị danh sách lịch đặt từ bộ nhớ đệm gần nhất.
            </span>
          </div>
          <button
            onClick={fetchBookings}
            className="font-semibold text-sky-900 hover:text-sky-950 underline self-end sm:self-auto shrink-0 cursor-pointer"
          >
            Thử kết nối lại
          </button>
        </div>
      )}

      {/* Thông báo lỗi khi không có cache */}
      {error && !isUsingCache && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-600 shrink-0" />
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
              onClick={fetchBookings}
              className="flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
            >
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        </div>
      )}

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
            {loading && bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-stone-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c59b48] mb-2" />
                  <span>Đang tải danh sách lịch đặt phòng...</span>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-stone-400">
                  {error
                    ? 'Không có dữ liệu lịch đặt để hiển thị khi mất kết nối mạng.'
                    : 'Không tìm thấy lịch đặt nào phù hợp với bộ lọc.'}
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
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
                    <div className="text-stone-400 text-[11px] font-light">
                      {b.startTime} - {b.endTime}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 font-medium text-stone-700">
                    {b.participantCount} người
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-stone-900 font-sans">
                    {Number(b.totalPrice).toLocaleString('vi-VN')}đ
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
                      {b.status === 'Confirmed'
                        ? 'Đã duyệt'
                        : b.status === 'Pending'
                        ? 'Chờ xử lý'
                        : b.status === 'Completed'
                        ? 'Đã hoàn tất'
                        : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {updatingId === (b.rawId || b.id) ? (
                        <Loader2 size={14} className="animate-spin text-stone-400" />
                      ) : (
                        <>
                          {b.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(b, 'Confirmed')}
                              title="Xác nhận lịch họp"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                            >
                              <Check size={13} />
                            </button>
                          )}
                          {b.status !== 'Completed' && (
                            <button
                              onClick={() => handleUpdateStatus(b, 'Completed')}
                              title="Đánh dấu đã hoàn tất"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                            >
                              <Clock size={13} />
                            </button>
                          )}
                          {b.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(b, 'Cancelled')}
                              title="Hủy lịch họp"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </>
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
  );
}
