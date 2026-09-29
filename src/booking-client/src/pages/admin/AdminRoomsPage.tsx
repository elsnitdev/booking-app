import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit3,
  MapPin,
  Monitor,
  Presentation,
  Video,
  Wifi,
  Loader2,
  RefreshCw,
  AlertCircle,
  WifiOff,
  ExternalLink
} from 'lucide-react';
import { adminRequest } from '../../requests/adminRequest';
import type { AdminRoomItem } from '../../types/admin';
import { useAdminToast } from '../../context/AdminToastContext';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);

  const { showToast } = useAdminToast();

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminRequest.getRooms();
      if (res.data) {
        setRooms(res.data);
        setIsUsingCache(false);
        // Lưu cache dữ liệu thật để hiển thị khi mất mạng
        try {
          localStorage.setItem('admin_cached_rooms', JSON.stringify(res.data));
        } catch {
          // Bỏ qua lỗi localStorage
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải danh sách phòng.';
      setError(errorMsg);

      // Nếu mất mạng hoặc lỗi máy chủ, thử lấy từ cache thật đã lưu trước đó
      const cached = localStorage.getItem('admin_cached_rooms');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRooms(parsed);
            setIsUsingCache(true);
            return;
          }
        } catch {
          // Bỏ qua lỗi parse
        }
      }
      // Nếu không có cache, để danh sách rỗng (không dùng mock data)
      setRooms([]);
      setIsUsingCache(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleToggleRoomStatus = async (roomId: string) => {
    try {
      await adminRequest.toggleRoomStatus(roomId);
      showToast('Đã thay đổi trạng thái khả dụng của phòng họp.', 'success');
      setRooms((prev) => {
        const updated = prev.map((r) => (r.id === roomId ? { ...r, isActive: !r.isActive } : r));
        try {
          localStorage.setItem('admin_cached_rooms', JSON.stringify(updated));
        } catch {
          // Bỏ qua
        }
        return updated;
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi đổi trạng thái phòng.';
      showToast(`Không thể thay đổi trạng thái khi mất kết nối mạng: ${errorMsg}`, 'error');
    }
  };

  const isUnauthorized = error?.toLowerCase().includes('unauthorized') || error?.includes('401');

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút Thêm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
            Danh Mục Tài Sản
          </span>
          <h2 className="text-2xl font-serif font-normal text-stone-900">
            Quản Lý Hệ Thống Không Gian Họp
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 font-light">
            Thiết lập giá thuê, sức chứa và kiểm soát tình trạng khả dụng của các phòng hội thảo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRooms}
            title="Làm mới"
            className="p-2.5 text-stone-600 hover:bg-stone-200/60 rounded-xl transition cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/admin/rooms/new"
            className="inline-flex items-center gap-2 bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <Plus size={15} />
            <span>Thêm Không Gian Mới</span>
          </Link>
        </div>
      </div>

      {/* Thông báo khi đang dùng cache ngoại tuyến lúc mất mạng */}
      {isUsingCache && (
        <div className="bg-sky-50 border border-sky-200 text-sky-900 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <WifiOff size={15} className="text-sky-600 shrink-0" />
            <span>
              Mất kết nối máy chủ API. Đang hiển thị danh mục phòng từ bộ nhớ đệm gần nhất.
            </span>
          </div>
          <button
            onClick={fetchRooms}
            className="font-semibold text-sky-900 hover:text-sky-950 underline self-end sm:self-auto shrink-0 cursor-pointer"
          >
            Thử kết nối lại
          </button>
        </div>
      )}

      {/* Thông báo lỗi khi không có cache */}
      {error && !isUsingCache && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
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
              onClick={fetchRooms}
              className="flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
            >
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Lưới danh sách phòng */}
      {loading && rooms.length === 0 ? (
        <div className="py-20 text-center text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c59b48] mb-3" />
          <p className="text-xs font-light">Đang nạp danh mục phòng họp...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
          <p className="text-sm">
            {error
              ? 'Không có dữ liệu phòng để hiển thị khi mất kết nối mạng.'
              : 'Chưa có không gian phòng họp nào trong hệ thống.'}
          </p>
          <Link
            to="/admin/rooms/new"
            className="mt-4 inline-flex items-center gap-2 bg-[#c59b48] hover:bg-[#b88e38] text-[#0b1220] px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            <Plus size={14} /> Thêm phòng đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`bg-white rounded-2xl border p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition flex flex-col justify-between hover:border-[#c59b48]/50 ${
                room.isActive
                  ? 'border-stone-200/90'
                  : 'border-stone-200 opacity-60 bg-stone-50/50'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#a67c2e] bg-[#c59b48]/10 px-2.5 py-0.5 rounded-full border border-[#c59b48]/20">
                      {room.roomType}
                    </span>
                    <Link
                      to={`/admin/rooms/${room.id}`}
                      className="group block mt-2"
                    >
                      <h3 className="text-xl font-serif font-normal text-stone-900 group-hover:text-[#a67c2e] transition">
                        {room.name}
                      </h3>
                    </Link>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                      room.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {room.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </span>
                </div>

                <p className="text-xs text-stone-500 flex items-center gap-1.5 font-light mb-4">
                  <MapPin size={13} className="text-[#c59b48] shrink-0" />
                  <span>{room.location || 'Địa điểm chưa cập nhật'}</span>
                </p>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-stone-100 text-xs mb-4">
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                      Sức Chứa
                    </span>
                    <span className="font-semibold text-stone-800">
                      {room.capacity} thành viên
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                      Giá Thuê / Giờ
                    </span>
                    <span className="font-semibold text-stone-800">
                      {Number(room.hourlyRate).toLocaleString('vi-VN')}đ
                    </span>
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
                  <Link
                    to={`/admin/rooms/${room.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-100 hover:bg-[#c59b48] hover:text-[#0b1220] text-stone-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Chi Tiết & Sửa</span>
                  </Link>
                  <Link
                    to={`/room/${room.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-900 px-2 py-1.5 transition"
                  >
                    <ExternalLink size={12} />
                    <span>Trang khách</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
