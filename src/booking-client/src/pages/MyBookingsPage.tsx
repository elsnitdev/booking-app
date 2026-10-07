import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Building, 
  Briefcase, 
  Mail, 
  User, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import { authRequest } from '../requests/authRequest';
import { bookingRequest } from '../requests/bookingRequest';
import { ApiError } from '../lib/httpClient';
import type { UserProfile } from '../types/auth';
import type { BookingItem } from '../types/booking';
import { useToast } from '../context/ToastContext';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // 1. Tải thông tin người dùng và danh sách phòng đã đặt
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [profileRes, bookingsRes] = await Promise.all([
          authRequest.getProfile(),
          bookingRequest.getMyBookings()
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
        }

        if (bookingsRes.data) {
          setBookings(bookingsRes.data);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login');
          return;
        }
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Lỗi kết nối đến máy chủ API.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 2. Xử lý Hủy Đặt Phòng
  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy lịch đặt phòng họp này không?');
    if (!confirmCancel) return;

    try {
      setCancellingId(bookingId);
      await bookingRequest.cancel(bookingId);

      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b)
      );
      toast.success('Đã hủy lịch đặt phòng thành công.');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Hủy phòng thất bại. Vui lòng thử lại.');
      } else {
        toast.error('Lỗi kết nối khi gửi yêu cầu hủy phòng.');
      }
    } finally {
      setCancellingId(null);
    }
  };

  // Lọc danh sách theo filter tab
  const filteredBookings = bookings.filter(b => {
    if (filter === 'confirmed') return b.status === 'Confirmed' || b.status === 'Pending';
    if (filter === 'cancelled') return b.status === 'Cancelled';
    return true;
  });

  const confirmedCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col text-stone-800">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-9 w-9 border-2 border-[#c59b48] border-t-transparent mb-3"></div>
          <p className="text-stone-500 text-sm font-light">Đang chuẩn bị hồ sơ doanh nghiệp & lịch họp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-20 text-stone-800">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 mt-8">
        
        {/* ================= KHỐI 1: HỒ SƠ DOANH NGHIỆP THÀNH VIÊN ================= */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-stone-200/80 overflow-hidden mb-10">
          {/* Header Cover Bar */}
          <div className="h-24 bg-[#0b1220] relative px-6 flex items-center justify-between border-b border-[#c59b48]/25">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#e6c87e] bg-[#c59b48]/20 px-3 py-1 rounded-full border border-[#c59b48]/30 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-[#c59b48]" />
                Tài Khoản Doanh Nghiệp
              </span>
            </div>
          </div>

          <div className="px-6 pb-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 gap-4 pb-6 border-b border-stone-100">
              <div className="flex items-end gap-4">
                {/* Monogram Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-[#0b1220] border-4 border-white shadow-md flex items-center justify-center text-2xl font-serif text-[#c59b48] font-normal italic">
                  {profile?.companyName ? profile.companyName.charAt(0).toUpperCase() : <User size={28} />}
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-normal text-stone-900 flex items-center gap-2">
                    {profile?.companyName || 'Doanh Nghiệp Đối Tác'}
                  </h1>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 font-light">
                    <Mail size={12} className="text-[#c59b48]" /> {profile?.email}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Link 
                to="/"
                className="inline-flex items-center gap-1.5 bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white px-4 py-2.5 rounded-xl text-xs font-medium transition duration-200 self-start sm:self-auto shadow-sm active:scale-[0.98]"
              >
                <Plus size={14} />
                <span>Đặt thêm phòng họp</span>
              </Link>
            </div>

            {/* Thông tin hồ sơ 3 cột */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6">
              <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                  <Building size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-stone-400 font-semibold block">Pháp Nhân</span>
                  <span className="text-xs font-semibold text-stone-800">{profile?.companyName || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                  <Briefcase size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-stone-400 font-semibold block">Khối / Phòng Ban</span>
                  <span className="text-xs font-semibold text-stone-800">{profile?.department || 'Điều hành & Vận hành'}</span>
                </div>
              </div>

              <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-stone-400 font-semibold block">Vai Trò Hệ Thống</span>
                  <span className="text-xs font-semibold text-stone-800">{profile?.role || 'Corporate Member'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= KHỐI 2: LỊCH ĐÃ ĐẶT (BOOKINGS MANAGEMENT) ================= */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-[0.18em] text-[#a67c2e] block mb-1">
                Quản Lý Hoạt Động
              </span>
              <h2 className="text-2xl font-serif font-normal text-stone-900 tracking-tight">
                Lịch Đặt Không Gian Của Tôi
              </h2>
              <p className="text-xs text-stone-500 mt-1 font-light">
                Theo dõi chi tiết thời gian biểu, điều chỉnh hoặc hủy lịch họp khi cần thiết.
              </p>
            </div>

            {/* Filter Tabs Segmented Control */}
            <div className="flex bg-white p-1 rounded-xl border border-stone-200/80 text-xs font-medium self-start sm:self-auto shadow-sm">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filter === 'all' ? 'bg-[#0b1220] text-[#e6c87e]' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Tất cả ({bookings.length})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filter === 'confirmed' ? 'bg-[#0b1220] text-[#e6c87e]' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Hiệu lực ({confirmedCount})
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filter === 'cancelled' ? 'bg-[#0b1220] text-[#e6c87e]' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Đã hủy ({cancelledCount})
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50/80 text-red-700 p-4 rounded-xl border border-red-200/80 text-xs mb-6 flex items-center gap-2">
              <AlertCircle size={16} /> 
              <span>{error}</span>
            </div>
          )}

          {/* Danh sách thẻ đặt phòng */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={26} />
              </div>
              <h3 className="text-base font-serif font-normal text-stone-900 mb-1">Chưa có lịch họp nào trong mục này</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6 font-light">
                Doanh nghiệp của bạn chưa phát sinh phiên họp nào tương ứng với bộ lọc đã chọn.
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center gap-1.5 bg-[#0b1220] text-[#e6c87e] px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#141f36] transition"
              >
                Khám phá không gian ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredBookings.map((b) => {
                const startDate = new Date(b.startTime);
                const endDate = new Date(b.endTime);
                const isCancelled = b.status === 'Cancelled';

                return (
                  <div 
                    key={b.id}
                    className={`bg-white rounded-2xl border p-5 transition shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.05)] ${
                      isCancelled ? 'border-stone-200 opacity-65 bg-stone-50/40' : 'border-stone-200/90'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      {/* Cột thông tin chính */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-semibold tracking-wider uppercase bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md border border-stone-200/60">
                            {b.room?.roomType || 'Phòng họp'}
                          </span>
                          
                          {isCancelled ? (
                            <span className="text-[11px] font-medium bg-stone-100 text-stone-500 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-stone-200">
                              <XCircle size={12} /> Đã hủy
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                              <CheckCircle2 size={12} className="text-emerald-600" /> Đã xác nhận
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-serif font-normal text-stone-900">
                          {b.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-500 font-light">
                          <span className="flex items-center gap-1 font-medium text-stone-800">
                            <Building size={13} className="text-[#c59b48]" /> {b.room?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} /> {b.room?.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={13} /> {b.participantCount} người tham dự
                          </span>
                        </div>
                      </div>

                      {/* Cột thời gian & Giá tiền */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-stone-100 gap-2 shrink-0">
                        <div className="text-left md:text-right">
                          <div className="flex items-center md:justify-end gap-1.5 text-xs font-semibold text-stone-800">
                            <Calendar size={13} className="text-[#c59b48]" />
                            <span>{startDate.toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center md:justify-end gap-1 text-[11px] text-stone-400 mt-0.5 font-light">
                            <Clock size={12} />
                            <span>
                              {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Tổng thanh toán</span>
                          <span className="text-base font-semibold text-stone-900 tracking-tight">
                            {Number(b.totalPrice).toLocaleString('vi-VN')}đ
                          </span>
                        </div>

                        {/* Nút Hủy Phòng */}
                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            disabled={cancellingId === b.id}
                            className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer active:scale-95"
                          >
                            {cancellingId === b.id ? 'Đang xử lý...' : 'Hủy lịch họp'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
