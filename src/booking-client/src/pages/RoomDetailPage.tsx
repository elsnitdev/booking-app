import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Users, Monitor, Wifi, Coffee, CheckCircle, MapPin, Star, ThumbsUp, ShieldCheck } from 'lucide-react';

export default function RoomDetailPage() {
  const { id } = useParams();
  const seed = id || '1';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <div className="container mx-auto max-w-5xl px-4 mt-6">
        <Link to="/" className="text-[#0f172a] font-semibold flex items-center gap-2 mb-4 hover:text-[#d4af37] transition w-max">
          <ArrowLeft size={18} /> Quay lại tìm kiếm
        </Link>
        
        {/* Header Chi tiết */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#0f172a] text-[#d4af37] border border-[#d4af37] px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 uppercase tracking-wider">Premium</span>
              <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><ShieldCheck size={12}/> Đối tác uy tín</span>
            </div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">Không Gian Họp Executive {id}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 font-medium hover:text-[#d4af37] transition cursor-pointer">
              <MapPin size={16} /> Tầng 3, Tòa nhà Alpha, Quận 1, TP.HCM
            </p>
          </div>
          
          <div className="hidden md:flex flex-col items-end">
            <div className="flex gap-2 items-center mb-1">
              <div className="text-right">
                <div className="font-bold text-gray-900 text-lg">Tuyệt vời</div>
                <div className="text-xs text-gray-500">124 đánh giá</div>
              </div>
              <div className="bg-[#d4af37] text-white rounded-md text-xl font-bold p-2 w-12 h-12 flex items-center justify-center shadow-md">5.0</div>
            </div>
          </div>
        </div>

        {/* Thư viện ảnh kiểu Grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] mb-8 rounded-xl overflow-hidden shadow-sm">
          <div className="col-span-2 row-span-2">
            <img src={`https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop&sig=${seed}1`} alt="Main" className="w-full h-full object-cover hover:opacity-95 transition cursor-pointer" />
          </div>
          <div className="col-span-1 row-span-1">
            <img src={`https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=400&auto=format&fit=crop&sig=${seed}2`} alt="Sub 1" className="w-full h-full object-cover hover:opacity-95 transition cursor-pointer" />
          </div>
          <div className="col-span-1 row-span-1">
            <img src={`https://images.unsplash.com/photo-1572025442646-866d16c84a54?q=80&w=400&auto=format&fit=crop&sig=${seed}3`} alt="Sub 2" className="w-full h-full object-cover hover:opacity-95 transition cursor-pointer" />
          </div>
          <div className="col-span-1 row-span-1">
            <img src={`https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=400&auto=format&fit=crop&sig=${seed}4`} alt="Sub 3" className="w-full h-full object-cover hover:opacity-95 transition cursor-pointer" />
          </div>
          <div className="col-span-1 row-span-1">
            <img src={`https://images.unsplash.com/photo-1505409859467-3a796fd5798e?q=80&w=400&auto=format&fit=crop&sig=${seed}5`} alt="Sub 4" className="w-full h-full object-cover hover:opacity-95 transition cursor-pointer" />
          </div>
        </div>
        
        {/* Nội dung chính chia 2 cột */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cột trái (Thông tin chi tiết) */}
          <div className="lg:w-2/3">
            <p className="text-gray-700 mb-6 leading-relaxed text-justify">
              Được thiết kế để truyền cảm hứng và tăng cường hiệu suất, phòng họp Executive mang đến không gian sang trọng với ánh sáng tự nhiên ngập tràn. Phù hợp hoàn hảo cho các buổi ký kết hợp đồng, họp hội đồng quản trị hoặc gặp gỡ đối tác chiến lược. Trang thiết bị tối tân được bảo trì thường xuyên đảm bảo mọi buổi họp diễn ra trơn tru nhất.
            </p>
            
            <h3 className="text-xl font-bold mb-4 text-gray-900">Các tiện nghi nổi bật nhất</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded border border-green-100">
                <Users size={20}/> <span className="font-medium">Sức chứa: 20 người</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-white p-2 rounded border border-gray-200 shadow-sm">
                <Monitor size={20} className="text-[#0071c2]"/> <span>Màn hình LED 85 inch</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-white p-2 rounded border border-gray-200 shadow-sm">
                <Wifi size={20} className="text-[#0071c2]"/> <span>Wifi 1000Mbps</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-white p-2 rounded border border-gray-200 shadow-sm">
                <Coffee size={20} className="text-[#0071c2]"/> <span>Pantry (Trà & Cà phê)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-white p-2 rounded border border-gray-200 shadow-sm">
                <ShieldCheck size={20} className="text-[#0071c2]"/> <span>Bảo mật cách âm</span>
              </div>
            </div>
            
          </div>
          
          {/* Cột phải (Hộp Đặt phòng Sticky) */}
          <div className="lg:w-1/3">
            <div className="bg-white border-t-4 border-[#d4af37] rounded-lg p-6 sticky top-6 shadow-xl">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-semibold">Giá thuê</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#0f172a]">200.000đ</span>
                  <span className="text-gray-500">/giờ</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên cuộc họp</label>
                  <input type="text" placeholder="VD: Q3 Planning" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#d4af37]" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày họp</label>
                  <input type="date" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#d4af37]" />
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu</label>
                    <input type="time" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#d4af37]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc</label>
                    <input type="time" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#d4af37]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng người (Max 20)</label>
                  <input type="number" min="1" max="20" placeholder="10" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-[#d4af37]" />
                </div>

                 <button className="w-full bg-[#0f172a] text-[#d4af37] py-3 rounded-md font-bold text-lg hover:bg-[#1e293b] transition flex justify-center items-center gap-2 shadow-md mt-2 border border-[#0f172a]">
                  <CheckCircle size={22} /> Đặt phòng
                </button>
              </div>
              
              <ul className="text-sm text-gray-500 space-y-2 border-t border-gray-100 pt-4">
                <li className="flex gap-2"><CheckCircle size={16} className="text-[#d4af37] flex-shrink-0"/> Nước suối & Trà miễn phí</li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-[#d4af37] flex-shrink-0"/> Hỗ trợ IT setup 15p trước giờ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
