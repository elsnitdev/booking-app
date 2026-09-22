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
  X,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { adminRequest } from '../../requests/adminRequest';
import type { AdminRoomItem, RoomManagePayload } from '../../types/admin';
import { useAdminToast } from '../../context/AdminToastContext';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<AdminRoomItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Executive Boardroom');
  const [formCapacity, setFormCapacity] = useState(12);
  const [formRate, setFormRate] = useState(350000);
  const [formLocation, setFormLocation] = useState('Tầng 18, Tòa tháp Bitexco, Q.1, TP.HCM');
  const [formProjector, setFormProjector] = useState(true);
  const [formWhiteboard, setFormWhiteboard] = useState(true);
  const [formVideo, setFormVideo] = useState(true);

  const { showToast } = useAdminToast();

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminRequest.getRooms();
      if (res.data) {
        setRooms(res.data);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải danh sách phòng.';
      setError(errorMsg);

      // Fallback: nạp từ localStorage nếu có
      const stored = localStorage.getItem('admin_rooms_state');
      if (stored) {
        setRooms(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

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

  const openEditRoomModal = (room: AdminRoomItem) => {
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

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSubmitting(true);
    const payload: RoomManagePayload = {
      name: formName.trim(),
      roomType: formType,
      capacity: Number(formCapacity),
      hourlyRate: Number(formRate),
      location: formLocation.trim(),
      hasProjector: formProjector,
      hasWhiteboard: formWhiteboard,
      hasVideoConference: formVideo,
      cleanupTimeMinutes: 15,
      isActive: editingRoom ? editingRoom.isActive : true,
    };

    try {
      if (editingRoom) {
        // Cập nhật qua API
        await adminRequest.updateRoom(editingRoom.id, payload);
        showToast(`Đã cập nhật thông tin "${formName}" thành công!`, 'success');
      } else {
        // Tạo mới qua API
        await adminRequest.createRoom(payload);
        showToast(`Đã tạo mới không gian "${formName}" thành công!`, 'success');
      }
      setIsRoomModalOpen(false);
      await fetchRooms();
    } catch (err: unknown) {
      // Fallback lưu cục bộ nếu backend lỗi
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi lưu phòng họp.';
      showToast(`${errorMsg} Đã lưu thay đổi vào bộ nhớ cục bộ.`, 'info');

      if (editingRoom) {
        const updated = rooms.map((r) =>
          r.id === editingRoom.id ? { ...r, ...payload } : r
        );
        setRooms(updated);
        localStorage.setItem('admin_rooms_state', JSON.stringify(updated));
      } else {
        const newRoom: AdminRoomItem = {
          id: `room-${Date.now()}`,
          ...payload,
          isActive: true,
        };
        const updated = [newRoom, ...rooms];
        setRooms(updated);
        localStorage.setItem('admin_rooms_state', JSON.stringify(updated));
      }
      setIsRoomModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRoomStatus = async (roomId: string) => {
    try {
      await adminRequest.toggleRoomStatus(roomId);
      showToast('Đã thay đổi trạng thái khả dụng của phòng họp.', 'success');
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, isActive: !r.isActive } : r))
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi đổi trạng thái phòng.';
      showToast(`${errorMsg} Đã cập nhật vào bộ nhớ tạm.`, 'info');
      setRooms((prev) => {
        const updated = prev.map((r) =>
          r.id === roomId ? { ...r, isActive: !r.isActive } : r
        );
        localStorage.setItem('admin_rooms_state', JSON.stringify(updated));
        return updated;
      });
    }
  };

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
          <button
            onClick={openAddRoomModal}
            className="inline-flex items-center gap-2 bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <Plus size={15} />
            <span>Thêm Không Gian Mới</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-600 shrink-0" />
            <span>
              {error.toLowerCase().includes('unauthorized') || error.includes('401')
                ? 'Phiên đăng nhập quản trị chưa được xác thực hoặc đã hết hạn (Unauthorized). Đang hiển thị bản sao lưu từ bộ nhớ.'
                : `${error} - Đang hiển thị bản sao lưu từ bộ nhớ trình duyệt.`}
            </span>
          </div>
          {(error.toLowerCase().includes('unauthorized') || error.includes('401')) && (
            <Link
              to="/login"
              className="font-semibold text-amber-900 hover:text-amber-950 underline self-end sm:self-auto shrink-0"
            >
              Đăng nhập lại
            </Link>
          )}
        </div>
      )}

      {/* Lưới danh sách phòng */}
      {loading && rooms.length === 0 ? (
        <div className="py-20 text-center text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c59b48] mb-3" />
          <p className="text-xs font-light">Đang nạp danh mục phòng họp...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`bg-white rounded-2xl border p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition flex flex-col justify-between ${
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
                    <h3 className="text-xl font-serif font-normal text-stone-900 mt-2">
                      {room.name}
                    </h3>
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
                  <span>{room.location}</span>
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
      )}

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
                {editingRoom
                  ? `Sửa Không Gian: ${editingRoom.name}`
                  : 'Thêm Phòng Họp & Workshop Mới'}
              </h3>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Tên phòng họp
                </label>
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
                  <label className="block text-stone-700 font-medium mb-1">
                    Loại không gian
                  </label>
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
                  <label className="block text-stone-700 font-medium mb-1">
                    Sức chứa tối đa (người)
                  </label>
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
                  <label className="block text-stone-700 font-medium mb-1">
                    Giá thuê niêm yết (VNĐ / giờ)
                  </label>
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
                  <label className="block text-stone-700 font-medium mb-1">
                    Vị trí phòng / Tầng
                  </label>
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
                <span className="block text-stone-700 font-medium mb-2">
                  Trang thiết bị & Tiện nghi đi kèm
                </span>
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
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white transition font-semibold cursor-pointer active:scale-98 shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingRoom ? 'Lưu Thay Đổi' : 'Tạo Không Gian'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
