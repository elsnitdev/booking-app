import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import RoomCard from "../components/RoomCard";
import { useEffect, useState } from "react";
import { Sparkles, Building2 } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export interface Room {
  id: string;
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
}

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getRooms = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/Rooms`);
        const result = await response.json();
        if (response.ok && result.data) {
          setRooms(result.data);
        } else {
          setError(result.message || "Không thể tải danh sách phòng.");
        }
      } catch (err) {
        setError(
          "Không thể kết nối đến máy chủ API (Hãy đảm bảo dotnet run đang chạy).",
        );
      } finally {
        setLoading(false);
      }
    };
    getRooms();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-20 text-stone-800">
      <Navbar />

      {/* Hero Section với ánh sáng tinh tế và typographic hierarchy chuẩn editorial */}
      <div className="bg-[#0b1220] text-white pt-20 pb-28 relative px-4 overflow-hidden border-b border-[#c59b48]/25">
        {/* Ambient warm light accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#c59b48]/10 via-[#c59b48]/5 to-transparent blur-3xl pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-[0.18em] uppercase bg-[#c59b48]/15 text-[#e6c87e] border border-[#c59b48]/30 mb-6 backdrop-blur-sm">
            <Sparkles size={12} className="text-[#c59b48]" />
            <span>Không Gian Họp & Workshop Doanh Nghiệp</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-stone-100 tracking-tight leading-[1.2] mb-6">
            Tinh Hoa <span className="italic text-[#c59b48] font-serif">Không Gian</span> Làm Việc
          </h1>

          <p className="text-base sm:text-lg text-stone-300/85 font-light max-w-2xl mx-auto leading-relaxed">
            Hệ thống phòng họp chiến lược, hội thảo nhóm và workshop chuyên biệt được thiết kế với chuẩn mực thẩm mỹ và công nghệ tối ưu.
          </p>
        </div>
      </div>

      <SearchBar />

      {/* Featured Spaces Section */}
      <div className="container mx-auto max-w-5xl mt-20 px-4">
        <div className="text-center mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a67c2e] block mb-2">
            Bộ Sưu Tập Tuyển Chọn
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-stone-900 tracking-tight mb-3">
            Không Gian Tiêu Biểu
          </h2>
          <div className="w-12 h-[2px] bg-[#c59b48]/60 mx-auto rounded-full"></div>
        </div>

        {/* Trạng thái Loading */}
        {loading && (
          <div className="text-center py-16 text-stone-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#c59b48] border-t-transparent mb-3"></div>
            <p className="text-sm font-light tracking-wide">Đang chuẩn bị danh mục không gian họp...</p>
          </div>
        )}

        {/* Trạng thái Lỗi */}
        {error && (
          <div className="bg-red-50/80 border border-red-200/90 text-red-700 p-4 rounded-xl text-center max-w-md mx-auto mb-8 text-sm">
            {error}
          </div>
        )}

        {/* Danh sách phòng thật */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-stone-500">
                <Building2 size={36} className="mx-auto mb-3 text-stone-300" />
                <p className="text-sm">Chưa có phòng họp nào được khởi tạo trong hệ thống.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
