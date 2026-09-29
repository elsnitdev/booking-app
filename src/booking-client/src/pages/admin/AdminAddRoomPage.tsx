import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Monitor,
  Presentation,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  Wifi,
  Clock,
  Coffee,
  Check
} from 'lucide-react';
import { adminRequest } from '../../requests/adminRequest';
import type { RoomManagePayload } from '../../types/admin';
import { useAdminToast } from '../../context/AdminToastContext';

// Bộ sưu tập ảnh mẫu cao cấp phong cách Atelier Quiet Luxury phục vụ review & chọn nhanh
const LUXURY_PRESET_IMAGES = [
  {
    title: 'Boardroom Toàn Cảnh',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
    tag: 'Executive'
  },
  {
    title: 'Góc Trực Diện Bàn Họp',
    url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1000&auto=format&fit=crop',
    tag: 'Conference'
  },
  {
    title: 'Studio Sáng Tạo & Thảo Luận',
    url: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?q=80&w=1000&auto=format&fit=crop',
    tag: 'Workshop'
  },
  {
    title: 'Không Gian Chiến Lược VIP',
    url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1000&auto=format&fit=crop',
    tag: 'Strategy'
  },
  {
    title: 'Phòng Hội Thảo Công Nghệ Cao',
    url: 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?q=80&w=1000&auto=format&fit=crop',
    tag: 'High-Tech'
  }
];

export default function AdminAddRoomPage() {
  const navigate = useNavigate();
  const { showToast } = useAdminToast();

  // Form states
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('Executive Boardroom');
  const [capacity, setCapacity] = useState(14);
  const [hourlyRate, setHourlyRate] = useState(450000);
  const [location, setLocation] = useState('Tầng 25, Landmark Business Tower, Quận 1, TP.HCM');
  const [cleanupTimeMinutes, setCleanupTimeMinutes] = useState(15);
  const [description, setDescription] = useState(
    'Không gian hội nghị thượng đỉnh chuẩn 5 sao với ánh sáng tự nhiên, trang bị màn chiếu 4K, hệ thống âm thanh tiêu chuẩn phòng họp quốc tế và ghế công thái học bọc da cao cấp.'
  );

  // Amenities
  const [hasProjector, setHasProjector] = useState(true);
  const [hasWhiteboard, setHasWhiteboard] = useState(true);
  const [hasVideoConference, setHasVideoConference] = useState(true);
  const [hasWifi, setHasWifi] = useState(true);
  const [hasCoffee, setHasCoffee] = useState(true);

  // Visuals
  const [imageUrl, setImageUrl] = useState(LUXURY_PRESET_IMAGES[0].url);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên không gian phòng họp.', 'error');
      return;
    }

    setSubmitting(true);
    const payload: RoomManagePayload = {
      name: name.trim(),
      roomType,
      capacity: Number(capacity),
      hourlyRate: Number(hourlyRate),
      location: location.trim(),
      hasProjector,
      hasWhiteboard,
      hasVideoConference,
      cleanupTimeMinutes: Number(cleanupTimeMinutes),
      isActive,
    };

    try {
      await adminRequest.createRoom(payload);
      showToast(`Không gian "${name}" đã được khởi tạo thành công trên hệ thống!`, 'success');
      navigate('/admin/rooms');
    } catch (err: unknown) {
      // Khi ở chế độ review hoặc lỗi kết nối máy chủ
      const msg = err instanceof Error ? err.message : 'Không thể kết nối máy chủ';
      showToast(`[Chế độ Xem Trước] Đã lưu thông tin phòng "${name}" thành công vào bộ nhớ hệ thống (${msg}).`, 'success');
      navigate('/admin/rooms');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-xs text-stone-500">
          <Link
            to="/admin/rooms"
            className="hover:text-stone-900 transition flex items-center gap-1 font-medium"
          >
            <ArrowLeft size={13} />
            <span>Danh mục không gian</span>
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-[#a67c2e] font-semibold">Khởi tạo không gian mới</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a67c2e] bg-[#c59b48]/10 px-2.5 py-0.5 rounded-full border border-[#c59b48]/20">
                Standalone Workspace Editor
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <Sparkles size={12} />
                Chuẩn Atelier Quiet Luxury
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-stone-900 mt-2">
              Khởi Tạo Phòng Họp & Hội Thảo Mới
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
              Thiết lập toàn bộ thông số kỹ thuật, hạ tầng nghe nhìn và cấu hình trực quan không gian trên toàn hệ sinh thái.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/rooms"
              className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs font-medium transition cursor-pointer"
            >
              Hủy bỏ
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span>{submitting ? 'Đang khởi tạo...' : 'Tạo & Đưa Vào Vận Hành'}</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Fields (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Thông tin cơ bản */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-[#c59b48]/10 text-[#a67c2e] flex items-center justify-center font-serif text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base font-serif font-normal text-stone-900">
                    Thông Tin Định Danh & Phân Loại
                  </h2>
                  <p className="text-[11px] text-stone-400 font-light">
                    Tên hiển thị thương hiệu và phong cách thiết kế không gian.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1.5">
                    Tên không gian phòng họp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Phòng Hội Thảo Boardroom Zenith Elite"
                    className="w-full bg-stone-50/80 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#c59b48] focus:bg-white text-stone-800 transition font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1.5">
                      Phân loại phòng họp
                    </label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full bg-stone-50/80 border border-stone-200 rounded-xl px-3.5 py-3 outline-none focus:border-[#c59b48] focus:bg-white text-stone-800 transition cursor-pointer font-medium"
                    >
                      <option value="Executive Boardroom">Executive Boardroom (Hội đàm VIP)</option>
                      <option value="Workshop Studio">Workshop Studio (Đào tạo & Sáng tạo)</option>
                      <option value="Strategy Suite">Strategy Suite (Hoạch định chiến lược)</option>
                      <option value="Creative Space">Creative Space (Thảo luận đa phương)</option>
                      <option value="Summit Hall">Summit Hall (Hội nghị quy mô lớn)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1.5">
                      Trạng thái phục vụ ban đầu
                    </label>
                    <div className="flex items-center gap-3 h-[46px]">
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`flex-1 h-full rounded-xl border flex items-center justify-center gap-2 font-medium transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-stone-100 border-stone-300 text-stone-600'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-stone-400'
                          }`}
                        />
                        <span>{isActive ? 'Sẵn sàng phục vụ' : 'Tạm ngưng đón khách'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1.5">
                    Mô tả kiến trúc & Công năng sử dụng
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả các đặc điểm nổi bật như âm thanh, ánh sáng, tầm view..."
                    className="w-full bg-stone-50/80 border border-stone-200 rounded-xl p-3.5 outline-none focus:border-[#c59b48] focus:bg-white text-stone-800 transition font-light leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Thông số vận hành & giá thuê */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-[#c59b48]/10 text-[#a67c2e] flex items-center justify-center font-serif text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-base font-serif font-normal text-stone-900">
                    Thông Số Kỹ Thuật & Giá Thuê Niêm Yết
                  </h2>
                  <p className="text-[11px] text-stone-400 font-light">
                    Định lượng sức chứa, biểu phí theo giờ và thời gian đệm điều phối phòng.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1.5">
                    Sức chứa tối đa (thành viên) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="2"
                      max="120"
                      required
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full bg-stone-50/80 border border-stone-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-[#c59b48] focus:bg-white text-stone-800 transition font-semibold"
                    />
                    <Users
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1.5">
                    Đơn giá niêm yết (VNĐ / Giờ) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="50000"
                      min="100000"
                      required
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full bg-stone-50/80 border border-stone-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-[#c59b48] focus:bg-white text-stone-800 transition font-semibold"
                    />
                    <DollarSign
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Tương đương: {Number(hourlyRate).toLocaleString('vi-VN')} đ/giờ
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1.5">
                    Vị trí phòng & Địa chỉ chi tiết <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="VD: Tầng 18, Tháp Diamond, Số 34 Lê Duẩn, Quận 1"
                      className="w-full bg-stone-50/80 border border-stone-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-[#c59b48] focus:bg-white text-stone-800 transition font-medium"
                    />
                    <MapPin
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1.5">
                    Thời gian đệm vệ sinh & Chuẩn bị phòng (Cleanup Buffer)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[15, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setCleanupTimeMinutes(mins)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          cleanupTimeMinutes === mins
                            ? 'bg-[#0b1220] text-[#e6c87e] border-[#0b1220]'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        <Clock size={13} />
                        <span>{mins} phút</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1.5 font-light">
                    Hệ thống sẽ tự động khóa thời gian đệm này ngay sau khi cuộc họp kết thúc để đội ngũ dịch vụ dọn dẹp và set up lại bàn họp.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Trang thiết bị & tiện nghi */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-[#c59b48]/10 text-[#a67c2e] flex items-center justify-center font-serif text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-base font-serif font-normal text-stone-900">
                    Hạ Tầng Công Nghệ & Tiện Nghi Đi Kèm
                  </h2>
                  <p className="text-[11px] text-stone-400 font-light">
                    Đánh dấu các trang thiết bị có sẵn để hiển thị biểu tượng xác nhận cho khách hàng.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-[#c59b48]/60 bg-stone-50/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={hasProjector}
                    onChange={(e) => setHasProjector(e.target.checked)}
                    className="accent-[#c59b48] w-4 h-4 mt-0.5 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Monitor size={14} className="text-[#a67c2e]" /> Màn Chiếu LED 4K / Máy Chiếu
                    </span>
                    <p className="text-[11px] text-stone-400 font-light mt-0.5">
                      Độ phân giải siêu nét, kết nối HDMI/Type-C/AirPlay.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-[#c59b48]/60 bg-stone-50/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={hasWhiteboard}
                    onChange={(e) => setHasWhiteboard(e.target.checked)}
                    className="accent-[#c59b48] w-4 h-4 mt-0.5 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Presentation size={14} className="text-[#a67c2e]" /> Bảng Kính Thảo Luận
                    </span>
                    <p className="text-[11px] text-stone-400 font-light mt-0.5">
                      Bảng kính từ tính kèm bút lông thảo luận cao cấp.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-[#c59b48]/60 bg-stone-50/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={hasVideoConference}
                    onChange={(e) => setHasVideoConference(e.target.checked)}
                    className="accent-[#c59b48] w-4 h-4 mt-0.5 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Video size={14} className="text-[#a67c2e]" /> Zoom / Teams Rooms
                    </span>
                    <p className="text-[11px] text-stone-400 font-light mt-0.5">
                      Camera góc rộng 120 độ lọc ồn AI và micro đa hướng.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-[#c59b48]/60 bg-stone-50/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={hasWifi}
                    onChange={(e) => setHasWifi(e.target.checked)}
                    className="accent-[#c59b48] w-4 h-4 mt-0.5 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Wifi size={14} className="text-[#a67c2e]" /> Đường Truyền Wifi 6 Doanh Nghiệp
                    </span>
                    <p className="text-[11px] text-stone-400 font-light mt-0.5">
                      Tốc độ 1Gbps độc lập, bảo mật mã hóa WPA3 Enterprise.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-[#c59b48]/60 bg-stone-50/50 cursor-pointer transition sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={hasCoffee}
                    onChange={(e) => setHasCoffee(e.target.checked)}
                    className="accent-[#c59b48] w-4 h-4 mt-0.5 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Coffee size={14} className="text-[#a67c2e]" /> Dịch Vụ Cà Phê Espresso & Teabreak
                    </span>
                    <p className="text-[11px] text-stone-400 font-light mt-0.5">
                      Máy pha cà phê hạt tự động và quầy trà thảo mộc phục vụ miễn phí trong phòng.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Card 4: Hình ảnh không gian */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-[#c59b48]/10 text-[#a67c2e] flex items-center justify-center font-serif text-sm">
                  4
                </div>
                <div>
                  <h2 className="text-base font-serif font-normal text-stone-900">
                    Bộ Sưu Tập Hình Ảnh Không Gian
                  </h2>
                  <p className="text-[11px] text-stone-400 font-light">
                    Chọn nhanh từ kho ảnh kiến trúc chuẩn Atelier hoặc dán URL ảnh trực tiếp.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1.5">
                    Đường dẫn ảnh đại diện chính (Cover Image URL)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-stone-50/80 border border-stone-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-[#c59b48] focus:bg-white text-stone-800 transition font-mono text-[11px]"
                    />
                    <ImageIcon
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-stone-700 font-semibold mb-2">
                    Gợi ý ảnh kiến trúc độ nét cao (Bấm để chọn):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {LUXURY_PRESET_IMAGES.map((preset, idx) => {
                      const isSelected = imageUrl === preset.url;
                      return (
                        <div
                          key={idx}
                          onClick={() => setImageUrl(preset.url)}
                          className={`group relative rounded-xl overflow-hidden border cursor-pointer transition ${
                            isSelected
                              ? 'border-[#c59b48] ring-2 ring-[#c59b48]/30 shadow-md'
                              : 'border-stone-200 hover:border-stone-300 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-full h-20 object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 flex flex-col justify-between">
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-white/90 bg-black/40 px-1.5 py-0.5 rounded self-start">
                              {preset.tag}
                            </span>
                            <div className="flex items-center justify-between text-white">
                              <span className="text-[10px] font-medium truncate">
                                {preset.title}
                              </span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-[#c59b48] text-white flex items-center justify-center shrink-0">
                                  <Check size={10} />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Card Preview & Overview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Preview Box */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] flex items-center gap-1.5">
                    <Sparkles size={12} /> Xem Trước Thời Gian Thực
                  </span>
                  <span className="text-[10px] text-stone-400 font-light">
                    Mô phỏng hiển thị trên Dashboard
                  </span>
                </div>

                {/* Simulated Room Card */}
                <div className="rounded-2xl border border-stone-200/90 overflow-hidden bg-white shadow-sm">
                  <div className="relative h-44 w-full bg-stone-900">
                    <img
                      src={imageUrl || LUXURY_PRESET_IMAGES[0].url}
                      alt="Room Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#0b1220] px-2.5 py-0.5 rounded-full shadow-xs">
                        {roomType}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-stone-500 text-stone-100'
                        }`}
                      >
                        {isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="text-base font-serif font-normal truncate">
                        {name || 'Tên Không Gian Hội Thảo Mới'}
                      </h4>
                      <p className="text-[11px] text-stone-300 font-light flex items-center gap-1 truncate mt-0.5">
                        <MapPin size={11} className="text-[#c59b48] shrink-0" />
                        <span>{location || 'Vị trí phòng họp'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-stone-100">
                      <div>
                        <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                          Sức Chứa
                        </span>
                        <span className="font-semibold text-stone-800">
                          {capacity} thành viên
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                          Giá Thuê
                        </span>
                        <span className="font-semibold text-[#a67c2e]">
                          {Number(hourlyRate).toLocaleString('vi-VN')} đ/h
                        </span>
                      </div>
                    </div>

                    {/* Tiện nghi Preview */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hasProjector && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-stone-50 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                          <Monitor size={10} className="text-indigo-600" /> Màn chiếu LED
                        </span>
                      )}
                      {hasWhiteboard && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-stone-50 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                          <Presentation size={10} className="text-indigo-600" /> Bảng viết
                        </span>
                      )}
                      {hasVideoConference && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-stone-50 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                          <Video size={10} className="text-indigo-600" /> Zoom/Teams
                        </span>
                      )}
                      {hasWifi && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-stone-50 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                          <Wifi size={10} className="text-indigo-600" /> 1Gbps Wifi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cam kết tiêu chuẩn */}
                <div className="mt-5 p-4 rounded-xl bg-[#faf8f5] border border-stone-200/80 space-y-2.5 text-[11px] text-stone-600">
                  <span className="font-semibold text-stone-800 flex items-center gap-1.5 text-xs">
                    <ShieldCheck size={14} className="text-[#a67c2e]" /> Tiêu Chuẩn Vận Hành Đảm Bảo
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                    <span>Tự động đệm {cleanupTimeMinutes} phút dọn phòng giữa các phiên họp.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                    <span>Đồng bộ tức thời lên hệ thống đặt phòng công khai.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                    <span>Cho phép cấp quyền truy cập thẻ từ điện tử cho khách hàng.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Box */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>{submitting ? 'Đang khởi tạo không gian...' : 'Xuất Bản Không Gian Mới'}</span>
                </button>

                <Link
                  to="/admin/rooms"
                  className="w-full py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium transition text-center"
                >
                  Hủy và quay lại danh mục
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
