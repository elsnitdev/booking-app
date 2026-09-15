import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import RoomCard from '../components/RoomCard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-[#0f172a] text-white pt-24 pb-32 relative px-4 border-b-4 border-[#d4af37]">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-5xl font-serif font-bold mb-6 tracking-wide text-[#f8fafc]">Tinh Hoa Không Gian Làm Việc</h2>
          <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto">Khám phá các phòng họp và không gian hội thảo đẳng cấp dành cho doanh nghiệp của bạn.</p>
        </div>
      </div>

      <SearchBar />

      {/* Recommended Rooms */}
      <div className="container mx-auto max-w-5xl mt-20 px-4">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">Không Gian Nổi Bật</h3>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto rounded"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <RoomCard key={i} id={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
