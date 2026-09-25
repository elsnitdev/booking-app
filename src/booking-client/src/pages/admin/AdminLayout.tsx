import { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn
} from 'lucide-react';
import { AdminToastContext, type ToastOptions } from '../../context/AdminToastContext';

export default function AdminLayout() {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kiểm tra token xác thực
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast({ message, type });
    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const toastContextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <AdminToastContext.Provider value={toastContextValue}>
      <div className="min-h-screen bg-[#faf8f5] text-stone-800 pb-20">
        <Navbar />

        {/* Cảnh báo chưa xác thực nếu chưa có token */}
        {!hasToken && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-900">
            <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                <span>
                  Bạn chưa đăng nhập. Vui lòng đăng nhập tài khoản quản trị để truy cập và quản lý dữ liệu hệ thống.
                </span>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 font-semibold text-amber-900 hover:text-amber-950 underline self-start sm:self-auto shrink-0"
              >
                <LogIn size={13} />
                <span>Đăng nhập ngay</span>
              </Link>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-medium border animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : 'bg-[#0b1220] text-[#e6c87e] border-[#c59b48]/40'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="text-rose-400" />
            ) : (
              <CheckCircle2 size={16} className="text-[#c59b48]" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Admin Top Banner */}
        <div className="bg-[#0b1220] text-white border-b border-[#c59b48]/25 pt-8 pb-10 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-[#c59b48]/20 text-[#e6c87e] border border-[#c59b48]/30">
                    <ShieldCheck size={12} className="text-[#c59b48]" />
                    Executive Control Console
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Hệ thống quản trị
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-normal text-stone-100 tracking-tight">
                  Bảng Điều Khiển <span className="italic text-[#c59b48]">Quản Trị Viên</span>
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 font-light mt-1">
                  Theo dõi hiệu suất vận hành, giám sát lịch họp doanh nghiệp và quản lý không gian hội thảo.
                </p>
              </div>
            </div>

            {/* Tab Navigation Menu using NavLink for separate routing */}
            <div className="flex flex-wrap gap-2 mt-8 border-t border-stone-800/80 pt-4 text-xs font-medium">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#c59b48] text-[#0b1220] font-semibold shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`
                }
              >
                <LayoutDashboard size={14} />
                <span>Tổng Quan & KPI</span>
              </NavLink>

              <NavLink
                to="/admin/bookings"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#c59b48] text-[#0b1220] font-semibold shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`
                }
              >
                <Calendar size={14} />
                <span>Quản Lý Lịch Đặt</span>
              </NavLink>

              <NavLink
                to="/admin/rooms"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#c59b48] text-[#0b1220] font-semibold shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`
                }
              >
                <Building2 size={14} />
                <span>Danh Mục Phòng</span>
              </NavLink>

              <NavLink
                to="/admin/clients"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#c59b48] text-[#0b1220] font-semibold shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`
                }
              >
                <Users size={14} />
                <span>Doanh Nghiệp Thành Viên</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Main Nested Content */}
        <div className="container mx-auto max-w-6xl px-4 mt-8">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-20 text-stone-500">
                <Loader2 className="w-7 h-7 animate-spin text-[#c59b48] mb-2" />
                <span className="text-xs font-light">Đang nạp phân hệ quản trị...</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </AdminToastContext.Provider>
  );
}
