import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-[#d4af37]">
          <h2 className="text-3xl font-serif font-bold mb-6 text-center text-[#0f172a]">Đăng nhập</h2>
          <form className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email / Tài khoản</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#d4af37]" />
                </div>
                <input type="text" className="pl-10 w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#d4af37]" placeholder="Nhập email doanh nghiệp..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#d4af37]" />
                </div>
                <input type="password" className="pl-10 w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#d4af37]" placeholder="••••••••" />
              </div>
            </div>
            <button type="button" className="bg-[#0f172a] text-[#d4af37] py-3 rounded-md font-bold mt-4 hover:bg-[#1e293b] transition flex justify-center items-center gap-2 border border-[#0f172a]">
              <LogIn size={20} /> Đăng nhập
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-4">
            Chưa có tài khoản? <Link to="/register" className="text-[#d4af37] font-semibold hover:underline">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
