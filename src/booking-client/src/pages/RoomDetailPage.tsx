import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Users, Monitor, Wifi, Coffee, CheckCircle, MapPin, ShieldCheck, Video, Presentation, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Room } from './HomePage';
import { API_BASE_URL } from '../config/api';

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Form states
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingMessage, setBookingMessage] = useState<string>('');

  // 1. Gọi API lấy thông tin chi tiết phòng
  useEffect(() => {
    const fetchRoomDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`${API_BASE_URL}/Rooms/${id}`);
        const result = await response.json();

        if (response.ok && result.data) {
          setRoom(result.data);
          if (result.data.capacity) {
            setParticipantCount(Math.min(5, result.data.capacity));
          }
        } else {
          setError(result.message || 'Không tìm thấy phòng.');
        }
      } catch (err) {
        setError('Không thể kết nối đến máy chủ API.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetail();
  }, [id]);

  // Tính thời lượng và ước tính tổng tiền
  const calculateTotal = () => {
    if (!startTime || !endTime || !room) return null;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const hours = (endH + endM / 60) - (startH + startM / 60);
    if (hours <= 0) return null;
    return {
      hours,
      total: hours * Number(room.hourlyRate)
    };
  };

  const estimate = calculateTotal();

  // 2. Xử lý gửi form đặt phòng
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập tài khoản doanh nghiệp trước khi đặt phòng!');
      navigate('/login');
      return;
    }

    if (!title || !date || !startTime || !endTime) {
      alert('Vui lòng nhập đầy đủ thông tin cuộc họp!');
      return;
    }

    if (!estimate || estimate.hours <= 0) {
      alert('Giờ kết thúc cuộc họp phải lớn hơn giờ bắt đầu!');
      return;
    }

    try {
      setBookingLoading(true);
      const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

      const response = await fetch(`${API_BASE_URL}/Bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: room?.id,
          title: title,
          startTime: startDateTime,
          endTime: endDateTime,
          participantCount: Number(participantCount)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setBookingMessage(result.message || 'Đặt phòng thất bại. Vui lòng thử lại.');
        return;
      }

      alert('Chúc mừng! Cuộc họp của bạn đã được đặt thành công.');
      navigate('/my-bookings');
    } catch (err) {
      setBookingMessage('Lỗi kết nối khi gửi thông tin đặt phòng.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col text-stone-800">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-9 w-9 border-2 border-[#c59b48] border-t-transparent mb-3"></div>
          <p className="text-stone-500 text-sm font-light">Đang chuẩn bị thông tin không gian...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col text-stone-800">
        <Navbar />
        <div className="container mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="bg-red-50/80 text-red-700 p-8 rounded-2xl border border-red-200/90 max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-2 font-serif">Thông báo</h3>
            <p className="text-sm mb-5 text-red-600">{error || 'Không tìm thấy dữ liệu không gian họp.'}</p>
            <Link to="/" className="inline-flex items-center gap-1.5 bg-[#0b1220] text-[#e6c87e] px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#141f36] transition">
              <ArrowLeft size={14} /> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const seed = room.id.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-20 text-stone-800">
      <Navbar />
      
      <div className="container mx-auto max-w-5xl px-4 mt-8">
        {/* Navigation Breadcrumb */}
        <Link 
          to="/" 
          className="text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1.5 mb-6 transition w-max"
        >
          <ArrowLeft size={14} /> 
          <span>Tất cả không gian</span>
        </Link>
        
        {/* Header Chi tiết */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="bg-[#0b1220] text-[#f3dfb2] border border-[#c59b48]/30 px-3 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.14em]">
                {room.roomType || 'Executive Boardroom'}
              </span>
              <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#c59b48]" /> Đạt chuẩn doanh nghiệp
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-stone-900 tracking-tight mb-2">
              {room.name}
            </h1>
            <p className="text-xs text-stone-500 flex items-center gap-1.5 font-light">
              <MapPin size={14} className="text-[#c59b48]" /> 
              <span>{room.location || 'Tòa nhà văn phòng đối tác'}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-auto bg-white px-3.5 py-2 rounded-2xl border border-stone-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className="text-right">
              <div className="text-xs font-semibold text-stone-800 flex items-center justify-end gap-1">
                <span>Xuất sắc</span>
                <Star size={12} className="text-[#c59b48] fill-[#c59b48]" />
              </div>
              <div className="text-[10px] text-stone-400 font-light">Đánh giá doanh nghiệp</div>
            </div>
            <div className="bg-[#c59b48] text-[#0b1220] rounded-xl text-base font-bold w-10 h-10 flex items-center justify-center">
              5.0
            </div>
          </div>
        </div>

        {/* Thư viện ảnh bố cục tạp chí */}
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[380px] sm:h-[440px] mb-10 rounded-2xl overflow-hidden border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="col-span-2 row-span-2 overflow-hidden bg-stone-100">
            <img 
              src={`https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop&sig=${seed}1`} 
              alt="Main View" 
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-700 cursor-pointer" 
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden bg-stone-100">
            <img 
              src={`https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=400&auto=format&fit=crop&sig=${seed}2`} 
              alt="Detail 1" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" 
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden bg-stone-100">
            <img 
              src={`https://images.unsplash.com/photo-1572025442646-866d16c84a54?q=80&w=400&auto=format&fit=crop&sig=${seed}3`} 
              alt="Detail 2" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" 
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden bg-stone-100">
            <img 
              src={`https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=400&auto=format&fit=crop&sig=${seed}4`} 
              alt="Detail 3" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" 
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden bg-stone-100">
            <img 
              src={`https://images.unsplash.com/photo-1505409859467-3a796fd5798e?q=80&w=400&auto=format&fit=crop&sig=${seed}5`} 
              alt="Detail 4" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" 
            />
          </div>
        </div>
        
        {/* Nội dung chính chia 2 cột */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cột trái: Thông tin phòng & Tiện nghi */}
          <div className="lg:w-2/3">
            <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-8">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a67c2e] block mb-2">
                Không Gian Làm Việc
              </span>
              <h2 className="text-xl font-serif font-normal text-stone-900 mb-4">
                Thiết Kế Đẳng Cấp Cho Các Cuộc Họp Trọng Yếu
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-light text-justify">
                Được bài trí với tiêu chuẩn cách âm cao cấp, đón trọn ánh sáng tự nhiên cùng hạ tầng công nghệ hội thảo trực tuyến đồng bộ. Không gian lý tưởng cho các cuộc họp hội đồng quản trị, ký kết hợp tác chiến lược hoặc các buổi workshop chuyên sâu của đội ngũ.
              </p>
              
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400 mb-4">
                Hạ Tầng & Tiện Ích Tích Hợp
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                  <div className="w-8 h-8 rounded-lg bg-[#c59b48]/10 text-[#c59b48] flex items-center justify-center shrink-0">
                    <Users size={16}/> 
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Quy mô</span>
                    <span className="text-xs font-semibold text-stone-800">Sức chứa {room.capacity} thành viên</span>
                  </div>
                </div>
                
                {room.hasProjector && (
                  <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                    <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                      <Monitor size={16}/> 
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Trình chiếu</span>
                      <span className="text-xs font-semibold text-stone-800">Màn hình LED 4K / Máy chiếu</span>
                    </div>
                  </div>
                )}

                {room.hasWhiteboard && (
                  <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                    <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                      <Presentation size={16}/> 
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Thảo luận</span>
                      <span className="text-xs font-semibold text-stone-800">Bảng kính & Bút dạ viết</span>
                    </div>
                  </div>
                )}

                {room.hasVideoConference && (
                  <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                    <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                      <Video size={16}/> 
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Trực tuyến</span>
                      <span className="text-xs font-semibold text-stone-800">Hội nghị truyền hình (Zoom/Teams)</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                  <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                    <Wifi size={16}/> 
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Kết nối</span>
                    <span className="text-xs font-semibold text-stone-800">Wifi chuyên dụng 1Gbps</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                  <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                    <Coffee size={16}/> 
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Dịch vụ</span>
                    <span className="text-xs font-semibold text-stone-800">Trà & Cà phê hạt chọn lọc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cột phải: Form Đặt phòng tinh tế */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sticky top-24 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
              <div className="mb-5 pb-4 border-b border-stone-100">
                <span className="text-[10px] uppercase tracking-[0.16em] text-stone-400 font-semibold block mb-1">
                  Giá Thuê Niêm Yết
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-stone-900 tracking-tight">
                    {Number(room.hourlyRate).toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs text-stone-400 font-light">/giờ</span>
                </div>
              </div>
              
              <form onSubmit={handleBooking} className="flex flex-col gap-4 mb-5">
                {bookingMessage && (
                  <div className="bg-red-50/90 text-red-700 text-xs p-3 rounded-xl border border-red-200 text-center">
                    {bookingMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Mục đích cuộc họp
                  </label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Họp Ban Giám Đốc Q3" 
                    className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Ngày họp
                  </label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800 cursor-pointer" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Bắt đầu</label>
                    <input 
                      type="time" 
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800 cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Kết thúc</label>
                    <input 
                      type="time" 
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800 cursor-pointer" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Số người tham dự (Tối đa {room.capacity})
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    max={room.capacity} 
                    required
                    value={participantCount}
                    onChange={(e) => setParticipantCount(Number(e.target.value))}
                    className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800" 
                  />
                </div>

                {/* Dự toán chi phí thanh lịch */}
                {estimate && (
                  <div className="bg-[#fbf9f5] border border-[#c59b48]/30 p-3.5 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between text-stone-500">
                      <span>Thời lượng dự kiến:</span>
                      <span className="font-medium text-stone-700">{estimate.hours.toFixed(1)} giờ</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1.5 border-t border-[#c59b48]/20 text-stone-900 font-semibold">
                      <span>Tổng phí ước tính:</span>
                      <span className="text-base text-[#0b1220]">{estimate.total.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white py-3.5 rounded-xl font-medium text-xs tracking-wide transition duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.99] mt-1"
                >
                  {bookingLoading ? (
                    <div className="h-4 w-4 border-2 border-[#e6c87e] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle size={15} /> 
                      <span>Xác Nhận Đặt Lịch Họp</span>
                    </>
                  )}
                </button>
              </form>
              
              <ul className="text-[11px] text-stone-500 space-y-2 border-t border-stone-100 pt-4 font-light">
                <li className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-[#c59b48] shrink-0"/> 
                  <span>Trà, cà phê hạt và nước khoáng cao cấp sẵn sàng</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-[#c59b48] shrink-0"/> 
                  <span>Chuyên viên kỹ thuật hỗ trợ setup trước giờ họp 15 phút</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
