import { CalendarDays, Clock, Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="container mx-auto max-w-5xl -mt-10 relative z-10 px-4">
      <div className="bg-white/95 backdrop-blur-sm p-2.5 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.08)] flex flex-col md:flex-row border border-stone-200/90 gap-1">
        {/* Chọn Ngày */}
        <div className="flex-1 p-3.5 border-b md:border-b-0 md:border-r border-stone-100 flex items-center gap-3.5 hover:bg-stone-50/60 transition rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-[#c59b48]/10 flex items-center justify-center text-[#c59b48] shrink-0">
            <CalendarDays size={18} />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-[0.15em]">
              Ngày Họp
            </span>
            <input 
              type="date" 
              className="w-full outline-none text-stone-800 bg-transparent text-sm font-medium pt-0.5 cursor-pointer" 
              title="Chọn ngày họp" 
            />
          </div>
        </div>

        {/* Chọn Khung Giờ */}
        <div className="flex-1 p-3.5 border-b md:border-b-0 md:border-r border-stone-100 flex items-center gap-3.5 hover:bg-stone-50/60 transition">
          <div className="w-9 h-9 rounded-lg bg-[#c59b48]/10 flex items-center justify-center text-[#c59b48] shrink-0">
            <Clock size={18} />
          </div>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-[0.15em]">
                Bắt Đầu
              </span>
              <input 
                type="time" 
                className="w-full outline-none text-stone-800 bg-transparent text-sm font-medium pt-0.5 cursor-pointer" 
                title="Giờ bắt đầu" 
              />
            </div>
            <span className="text-stone-300 font-light">—</span>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-[0.15em]">
                Kết Thúc
              </span>
              <input 
                type="time" 
                className="w-full outline-none text-stone-800 bg-transparent text-sm font-medium pt-0.5 cursor-pointer" 
                title="Giờ kết thúc" 
              />
            </div>
          </div>
        </div>

        {/* Nút Tìm kiếm */}
        <button className="bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white px-8 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-sm active:scale-[0.99]">
          <Search size={16} /> 
          <span className="tracking-wide">Tìm Không Gian</span>
        </button>
      </div>
    </div>
  );
}
