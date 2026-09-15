import { CalendarDays, Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="container mx-auto max-w-5xl -mt-12 relative z-10 px-4">
      <div className="bg-white p-2 rounded-lg shadow-2xl flex flex-col md:flex-row border border-gray-200">
        <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-200 flex items-center gap-3 hover:bg-gray-50 transition rounded-l-lg">
          <CalendarDays className="text-[#d4af37]" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Ngày họp</span>
            <input type="date" className="w-full outline-none text-gray-800 bg-transparent font-medium" title="Date" />
          </div>
        </div>
        <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-200 flex items-center gap-3 hover:bg-gray-50 transition">
          <div className="flex flex-col w-1/2 border-r border-gray-200 pr-2">
             <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Bắt đầu</span>
             <input type="time" className="w-full outline-none text-gray-800 bg-transparent font-medium" title="Start Time" />
          </div>
          <div className="flex flex-col w-1/2 pl-2">
             <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Kết thúc</span>
             <input type="time" className="w-full outline-none text-gray-800 bg-transparent font-medium" title="End Time" />
          </div>
        </div>
        <button className="bg-[#0f172a] text-[#d4af37] text-lg font-bold px-10 py-4 flex items-center justify-center gap-2 hover:bg-[#1e293b] transition rounded-r-lg border border-[#0f172a]">
          <Search size={20} /> Tìm Kiếm
        </button>
      </div>
    </div>
  );
}
