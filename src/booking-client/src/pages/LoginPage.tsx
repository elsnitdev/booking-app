import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Mail, Lock, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { authRequest } from "../requests/authRequest";
import { ApiError } from "../lib/httpClient";
import type { LoginPayload } from "../types/auth";
import { useToast } from "../context/ToastContext";

type LoginFormData = LoginPayload;

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg("");
    try {
      const result = await authRequest.login(data);

      // Lưu JWT token vào localStorage
      if (result.data) {
        localStorage.setItem("token", result.data);
      }

      toast.success("Đăng nhập tài khoản thành công!");
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
        toast.error(err.message);
      } else {
        setErrorMsg("Lỗi kết nối đến server.");
        toast.error("Lỗi kết nối đến server.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col text-stone-800">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.06)] w-full max-w-md border border-stone-200/90">
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#a67c2e] block mb-1">
              Cổng Thành Viên
            </span>
            <h2 className="text-3xl font-serif font-normal text-stone-900 tracking-tight">
              Đăng Nhập
            </h2>
            <p className="text-xs text-stone-500 mt-1 font-light">
              Truy cập tài khoản doanh nghiệp và quản lý lịch họp
            </p>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {errorMsg && (
              <div className="bg-red-50/90 border border-red-200/90 text-red-700 p-3 rounded-xl text-xs text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Email Doanh Nghiệp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-[#c59b48]" />
                </div>
                <input
                  type="text"
                  className="pl-10 w-full py-2.5 px-3.5 text-xs bg-stone-50/50 border border-stone-200/90 rounded-xl outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800"
                  placeholder="contact@company.com"
                  {...register("email", { required: "Vui lòng nhập email" })}
                />
              </div>
              {errors.email && (
                <span className="text-[11px] text-red-600 mt-1 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Mật Khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-[#c59b48]" />
                </div>
                <input
                  type="password"
                  className="pl-10 w-full py-2.5 px-3.5 text-xs bg-stone-50/50 border border-stone-200/90 rounded-xl outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                  })}
                />
              </div>
              {errors.password && (
                <span className="text-[11px] text-red-600 mt-1 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white py-3 rounded-xl font-medium text-xs tracking-wide mt-2 transition duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer active:scale-[0.99]"
            >
              <LogIn size={15} /> 
              <span>Đăng Nhập</span>
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-500 border-t border-stone-100 pt-4 font-light">
            Chưa có tài khoản doanh nghiệp?{" "}
            <Link
              to="/register"
              className="text-[#a67c2e] hover:text-[#c59b48] font-medium ml-1 transition"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
