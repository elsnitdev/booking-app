import { Link, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Calendar, LogOut, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { authRequest } from "../requests";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    authRequest
      .getProfile()
      .then((res) => {
        if (res.data) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {
        // Nếu chưa đăng nhập hoặc cookie hết hạn, server trả về 401
        setIsLoggedIn(false);
      });
  }, []);
  const handleLogout = async () => {
    try {
      // 1. Gọi API để Server xóa HttpOnly Cookie
      await authRequest.logout();
    } catch (error) {
      console.error("Lỗi khi đăng xuất từ server:", error);
    } finally {
      // 2. Dù API thành công hay gặp lỗi mạng, phía Client vẫn chủ động dọn dẹp
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      toast.success("Đã đăng xuất thành công!");
      navigate("/login");
    }
  };
  return (
    <nav className="bg-[#0b1220]/95 backdrop-blur-md text-[#f8fafc] px-6 py-4 border-b border-stone-800/70 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto flex justify-between items-center max-w-5xl">
        {/* Brand Typographic Mark */}
        <Link to="/" className="group flex items-baseline gap-2 transition">
          <span className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#c59b48] group-hover:text-[#dcb35f] transition italic">
            Alpha
          </span>
          <span className="text-xs sm:text-sm font-medium tracking-[0.22em] text-stone-200 uppercase">
            Workplace
          </span>
        </Link>

        {/* Action Controls */}
        {!isLoggedIn ? (
          <div className="flex gap-2 sm:gap-3 items-center">
            <Link
              to="/admin"
              className="text-stone-300 hover:text-[#e6c87e] px-2.5 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition rounded-lg hover:bg-stone-800/50"
              title="Khu vực Quản trị viên"
            >
              <ShieldCheck size={15} className="text-[#c59b48]" />
              <span className="hidden sm:inline">Quản trị</span>
            </Link>
            <Link
              to="/register"
              className="text-stone-300 hover:text-white px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition rounded-lg hover:bg-stone-800/50"
            >
              <UserPlus size={15} className="text-[#c59b48]" />
              <span>Đăng ký</span>
            </Link>
            <Link
              to="/login"
              className="bg-[#c59b48] hover:bg-[#b58b38] text-[#0b1220] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition rounded-lg shadow-sm hover:shadow active:scale-[0.98]"
            >
              <LogIn size={15} />
              <span>Đăng nhập</span>
            </Link>
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-2.5 items-center">
            <Link
              to="/admin"
              className="text-stone-300 hover:text-[#e6c87e] px-2.5 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition rounded-lg hover:bg-stone-800/50"
              title="Khu vực Quản trị viên"
            >
              <ShieldCheck size={15} className="text-[#c59b48]" />
              <span className="hidden sm:inline">Quản trị</span>
            </Link>
            <Link
              to="/my-bookings"
              className="bg-stone-800/90 border border-stone-700/80 text-stone-200 px-3.5 py-2 text-xs sm:text-sm font-medium flex items-center gap-2 hover:bg-stone-700/90 hover:text-white transition rounded-lg shadow-sm"
            >
              <Calendar size={15} className="text-[#c59b48]" />
              <span>Hồ sơ & Lịch họp</span>
            </Link>
            <button
              onClick={handleLogout}
              className="border border-red-900/40 text-red-300/80 hover:text-red-200 hover:bg-red-950/40 px-3 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition rounded-lg cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
