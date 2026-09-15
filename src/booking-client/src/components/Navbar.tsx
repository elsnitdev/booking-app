import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-[#0f172a] text-[#f8fafc] p-4 border-b border-[#1e293b]">
      <div className="container mx-auto flex justify-between items-center max-w-5xl">
        <Link to="/" className="text-2xl font-serif font-bold flex items-center gap-2">
          <span className="text-[#d4af37]">Alpha</span>Workplace
        </Link>
        <div className="flex gap-4">
          <Link to="/register" className="border border-[#d4af37] text-[#d4af37] px-4 py-2 font-semibold flex items-center gap-2 hover:bg-[#d4af37] hover:text-white transition rounded-sm">
            <UserPlus size={18} /> Đăng ký
          </Link>
          <Link to="/login" className="bg-[#d4af37] text-white px-4 py-2 font-semibold flex items-center gap-2 hover:bg-[#b48608] transition rounded-sm shadow-md">
            <LogIn size={18} /> Đăng nhập
          </Link>
        </div>
      </div>
    </nav>
  );
}
