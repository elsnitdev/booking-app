import { Link } from 'react-router-dom';
import { Users, MapPin, Star, ArrowUpRight } from 'lucide-react';
import type { Room } from '../types/room';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/80 overflow-hidden flex flex-col group hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] hover:border-stone-300 transition-all duration-300">
      {/* Hình ảnh phòng với hiệu ứng zoom mượt mà */}
      <div className="relative overflow-hidden h-52 bg-stone-100">
        <img 
          src={`https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop&sig=${room.id.slice(0, 4)}`} 
          alt={room.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-[#0b1220]/75 backdrop-blur-md border border-[#c59b48]/30 text-[#f3dfb2] text-[10px] font-medium tracking-[0.14em] uppercase px-2.5 py-1 rounded-full shadow-sm">
          {room.roomType || "Hội thảo"}
        </div>
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-[#0b1220]/75 backdrop-blur-md border border-white/10 text-stone-200 text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Star size={11} className="text-[#c59b48] fill-[#c59b48]" />
          <span>5.0</span>
        </div>
      </div>
      
      {/* Nội dung Card */}
      <div className="p-5 flex flex-col flex-1">
        <h4 className="font-serif font-medium text-lg text-stone-900 group-hover:text-[#a67c2e] transition-colors line-clamp-1 mb-1.5" title={room.name}>
          {room.name}
        </h4>
        
        <p className="text-xs text-stone-500 font-light mb-3.5 flex items-center gap-1.5 truncate">
          <MapPin size={13} className="text-[#c59b48] shrink-0" /> 
          <span className="truncate">{room.location || "Tòa nhà văn phòng đối tác"}</span>
        </p>
        
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60 font-medium">
            <Users size={13} className="text-[#c59b48]"/> 
            <span>Sức chứa: {room.capacity} khách</span>
          </span>
        </div>
        
        {/* Giá và nút hành động */}
        <div className="mt-auto pt-3.5 border-t border-stone-100 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400 block">Từ</span>
            <div className="flex items-baseline gap-0.5">
              <span className="font-semibold text-lg text-stone-900 tracking-tight">
                {Number(room.hourlyRate).toLocaleString("vi-VN")}đ
              </span>
              <span className="text-[11px] text-stone-400 font-light">/giờ</span>
            </div>
          </div>

          <Link 
            to={`/room/${room.id}`} 
            className="inline-flex items-center gap-1 bg-stone-900 hover:bg-[#c59b48] text-stone-200 hover:text-[#0b1220] px-3.5 py-2 rounded-xl text-xs font-medium transition duration-200 shadow-sm active:scale-[0.98]"
          >
            <span>Khám phá</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
