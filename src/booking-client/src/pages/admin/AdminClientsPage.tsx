import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RefreshCw, AlertCircle, Building, Award, WifiOff } from 'lucide-react';
import { adminRequest } from '../../requests/adminRequest';
import type { CorporateUserItem } from '../../types/admin';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<CorporateUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminRequest.getCorporateUsers();
      if (res.data) {
        setClients(res.data);
        setIsUsingCache(false);
        // Lưu cache dữ liệu thật để hiển thị khi mất mạng
        try {
          localStorage.setItem('admin_cached_clients', JSON.stringify(res.data));
        } catch {
          // Bỏ qua lỗi localStorage nếu đầy
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải danh sách doanh nghiệp đối tác.';
      setError(errorMsg);

      // Nếu mất mạng hoặc lỗi máy chủ, kiểm tra xem có cache dữ liệu thật trước đó không
      const cached = localStorage.getItem('admin_cached_clients');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setClients(parsed);
            setIsUsingCache(true);
            return;
          }
        } catch {
          // Bỏ qua lỗi parse
        }
      }
      // Nếu không có cache, để danh sách rỗng (không dùng dữ liệu mẫu giả lập)
      setClients([]);
      setIsUsingCache(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const getTier = (spent: number) => {
    if (spent >= 25000000) return 'Diamond Corporate';
    if (spent >= 12000000) return 'Gold Partner';
    return 'Standard Business';
  };

  const isUnauthorized = error?.toLowerCase().includes('unauthorized') || error?.includes('401');

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a67c2e] block">
            Mạng Lưới Khách Hàng
          </span>
          <h2 className="text-2xl font-serif font-normal text-stone-900">
            Tài Khoản Doanh Nghiệp Đối Tác
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 font-light">
            Danh sách các tập đoàn, doanh nghiệp đã kích hoạt tài khoản hội viên trên Alpha Workplace.
          </p>
        </div>

        <button
          onClick={fetchClients}
          title="Làm mới dữ liệu"
          className="p-2.5 text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer self-start md:self-auto"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Thông báo khi đang dùng cache ngoại tuyến lúc mất mạng */}
      {isUsingCache && (
        <div className="mb-4 bg-sky-50 border border-sky-200 text-sky-900 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <WifiOff size={15} className="text-sky-600 shrink-0" />
            <span>
              Mất kết nối máy chủ API. Đang hiển thị danh sách doanh nghiệp đối tác từ bộ nhớ đệm gần nhất.
            </span>
          </div>
          <button
            onClick={fetchClients}
            className="font-semibold text-sky-900 hover:text-sky-950 underline self-end sm:self-auto shrink-0 cursor-pointer"
          >
            Thử kết nối lại
          </button>
        </div>
      )}

      {/* Thông báo lỗi khi không có dữ liệu cache */}
      {error && !isUsingCache && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-600 shrink-0" />
            <span>
              {isUnauthorized
                ? 'Phiên đăng nhập quản trị chưa được xác thực hoặc đã hết hạn (Unauthorized).'
                : `Không thể kết nối đến máy chủ API: ${error}.`}
            </span>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            {isUnauthorized && (
              <Link
                to="/login"
                className="font-semibold text-amber-900 hover:text-amber-950 underline"
              >
                Đăng nhập lại
              </Link>
            )}
            <button
              onClick={fetchClients}
              className="flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
            >
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px] font-semibold">
              <th className="pb-3 pr-4">Mã Đối Tác</th>
              <th className="pb-3 pr-4">Doanh Nghiệp / Email</th>
              <th className="pb-3 pr-4">Khối / Phòng Ban</th>
              <th className="pb-3 pr-4">Cấp Hội Viên</th>
              <th className="pb-3 pr-4">Số Phiên Họp</th>
              <th className="pb-3 pr-4">Tổng Chi Tiêu</th>
              <th className="pb-3 text-right">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading && clients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c59b48] mb-2" />
                  <span>Đang tải dữ liệu doanh nghiệp đối tác...</span>
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone-400">
                  {error
                    ? 'Không có dữ liệu đối tác để hiển thị khi mất kết nối mạng.'
                    : 'Chưa có doanh nghiệp đối tác nào đăng ký trong hệ thống.'}
                </td>
              </tr>
            ) : (
              clients.map((c) => {
                const tier = c.tier || getTier(c.totalSpent);
                const code = c.id.startsWith('CLI-')
                  ? c.id
                  : `CLI-${c.id.substring(0, 4).toUpperCase()}`;

                return (
                  <tr key={c.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 pr-4 font-mono font-medium text-stone-600">
                      {code}
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-stone-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#0b1220] text-[#c59b48] flex items-center justify-center font-serif text-xs shrink-0">
                          {c.companyName ? c.companyName.charAt(0) : <Building size={12} />}
                        </div>
                        <span className="truncate max-w-xs">{c.companyName || c.username}</span>
                      </div>
                      <div className="text-stone-400 text-[11px] font-light pl-9 mt-0.5">
                        {c.email}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 font-medium text-stone-700">
                      {c.department || 'Văn phòng điều hành'}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          tier === 'Diamond Corporate'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : tier === 'Gold Partner'
                            ? 'bg-stone-100 text-stone-800 border border-stone-300'
                            : 'bg-stone-50 text-stone-600 border border-stone-200'
                        }`}
                      >
                        <Award size={10} className="text-[#c59b48]" />
                        {tier}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-stone-900">
                      {c.totalMeetings} cuộc họp
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-stone-900 font-sans">
                      {Number(c.totalSpent).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Đang hoạt động
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
