import { Link } from 'react-router-dom';
import { Users, MapPin, ThumbsUp } from 'lucide-react';

interface RoomCardProps {
  id: number;
}

export default function RoomCard({ id }: RoomCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
      {/* Hình ảnh có hiệu ứng zoom khi hover */}
      <div className="relative overflow-hidden h-52">
        <img 
          src={`https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop&sig=${id}`} 
          alt="Room" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 bg-[#0f172a] border border-[#d4af37] text-[#d4af37] text-xs font-bold px-2 py-1 rounded shadow">
          Premium
        </div>
        <div className="absolute top-3 right-3 bg-[#d4af37] text-white text-xs font-bold p-1.5 rounded-full flex gap-1 items-center shadow">
          <ThumbsUp size={12} /> <span className="mr-1">5.0</span>
        </div>
      </div>
      
      {/* Nội dung Card */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-serif font-bold text-lg text-gray-900 line-clamp-1">Phòng họp Executive {id}</h4>
        </div>
        
        <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1 hover:text-[#d4af37] transition cursor-pointer">
          <MapPin size={14} /> Tầng 3, Tòa nhà Alpha
        </p>
        
        <p className="text-sm text-gray-600 mb-4 flex items-center gap-2 border-l-2 border-[#d4af37] pl-2">
          <Users size={16} className="text-[#d4af37]"/> Sức chứa: 20 người
        </p>
        
        {/* Giá và nút */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Bắt đầu từ</p>
            <span className="font-bold text-xl text-[#0f172a]">200.000đ<span className="text-xs font-normal text-gray-500">/giờ</span></span>
          </div>
          <Link to={`/room/${id}`} className="bg-[#0f172a] text-[#d4af37] border border-[#d4af37] px-4 py-2 rounded font-semibold flex items-center gap-1 hover:bg-[#d4af37] hover:text-white transition shadow-sm hover:shadow">
             Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
