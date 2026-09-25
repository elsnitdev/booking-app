import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Users,
  Monitor,
  Wifi,
  Coffee,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Video,
  Presentation,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Room } from "../types/room";
import { roomRequest } from "../requests/roomRequest";
import { bookingRequest } from "../requests/bookingRequest";
import { ApiError } from "../lib/httpClient";
import type { OccupiedSlot } from "../requests/roomRequest";
import { useToast } from "../context/ToastContext";

export interface UnifiedSlot {
  id: string;
  type: "occupied" | "available";
  start: string;
  end: string;
  blockedUntil?: string;
  title?: string;
  durationMinutes: number;
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Form states
  const [title, setTitle] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingMessage, setBookingMessage] = useState<string>("");
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [cleanupTimeMinutes, setCleanupTimeMinutes] = useState<number>(15);
  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  // 1. Gọi API lấy thông tin chi tiết phòng
  useEffect(() => {
    const fetchRoomDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError("");
        const result = await roomRequest.getById(id);

        if (result.data) {
          setRoom(result.data);
          if (result.data.capacity) {
            setParticipantCount(Math.min(5, result.data.capacity));
          }
          if (result.data.cleanupTimeMinutes !== undefined) {
            setCleanupTimeMinutes(result.data.cleanupTimeMinutes);
          }
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Không thể kết nối đến máy chủ API.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetail();
  }, [id]);
  // useEffect(() => {
  //   // Nếu chưa có id phòng hoặc người dùng chưa chọn ngày thì chưa gọi
  //   if (!id || !date) return;
  //   const fetchOccupiedSlots = async () => {
  //     try {
  //       setLoadingSlots(true);
  //       const result = await roomRequest.getOccupiedSlots(id, date);

  //       if (result.data) {
  //         setOccupiedSlots(result.data.occupiedSlots || []);
  //         if (result.data.cleanupTimeMinutes !== undefined) {
  //           setCleanupTimeMinutes(result.data.cleanupTimeMinutes);
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Lỗi khi lấy khung giờ bận:", err);
  //     } finally {
  //       setLoadingSlots(false);
  //     }
  //   };
  //   fetchOccupiedSlots();
  // }, [id, date]);
  const fetchOccupiedSlots = useCallback(async () => {
    if (!id || !date) return;
    try {
      setLoadingSlots(true);
      const result = await roomRequest.getOccupiedSlots(id, date);

      if (result.data) {
        setOccupiedSlots(result.data.occupiedSlots || []);
        if (result.data.cleanupTimeMinutes !== undefined) {
          setCleanupTimeMinutes(result.data.cleanupTimeMinutes);
        }
      }
    } catch (err) {
      console.error("Lỗi khi lấy khung giờ bận:", err);
    } finally {
      setLoadingSlots(false);
    }
  }, [id, date]);

  useEffect(() => {
    fetchOccupiedSlots();
  }, [fetchOccupiedSlots]);
  // Chuyển chuỗi thời gian (ISO hoặc "HH:mm") thành số phút tính từ 00:00
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    if (timeStr.includes("T")) {
      const d = new Date(timeStr);
      return d.getHours() * 60 + d.getMinutes();
    }
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  };

  // Định dạng số phút thành chuỗi "HH:mm"
  const formatMinutesToTime = (totalMinutes: number): string => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // Format ISO time sang "HH:mm"
  const formatIsoToTime = (isoString: string): string => {
    return formatMinutesToTime(parseTimeToMinutes(isoString));
  };

  // Kiểm tra khung giờ đang chọn có bị đè lên lịch đã đặt trước không (tính cả thời gian dọn dẹp)
  const isSelectedTimeOverlapping = () => {
    if (!startTime || !endTime || occupiedSlots.length === 0) return false;
    const userStart = parseTimeToMinutes(startTime);
    const userEnd = parseTimeToMinutes(endTime);
    if (userEnd <= userStart) return false;

    return occupiedSlots.some((slot) => {
      const slotStart = parseTimeToMinutes(slot.startTime);
      const slotBlockedUntil = parseTimeToMinutes(slot.blockedUntil);
      return userStart < slotBlockedUntil && userEnd > slotStart;
    });
  };

  const hasConflict = isSelectedTimeOverlapping();

  const slotScrollRef = useRef<HTMLDivElement>(null);

  const scrollSlots = (direction: "left" | "right") => {
    if (slotScrollRef.current) {
      const amount = direction === "left" ? -320 : 320;
      slotScrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Danh sách 5 ngày liên tiếp bắt đầu từ hôm nay cho dải chọn ngày nằm ngang
  const dateTabs = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isoStr = d.toISOString().split("T")[0];
    const isToday = i === 0;
    const isTomorrow = i === 1;

    const weekdayLabel = isToday
      ? "Hôm nay"
      : isTomorrow
        ? "Ngày mai"
        : d.toLocaleDateString("vi-VN", { weekday: "short" });

    const dayMonthLabel = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });

    return {
      date: isoStr,
      weekday: weekdayLabel,
      dayMonth: dayMonthLabel,
    };
  });

  // Tạo danh sách các khung giờ trong ngày theo thứ tự thời gian (08:00 - 20:00)
  const getChronologicalSlots = (): UnifiedSlot[] => {
    const DAY_START = 8 * 60; // 08:00
    const DAY_END = 20 * 60; // 20:00

    if (occupiedSlots.length === 0) {
      return [
        {
          id: "free-1",
          type: "available",
          start: "08:30",
          end: "10:30",
          durationMinutes: 120,
          title: "Khung giờ sáng sớm",
        },
        {
          id: "free-2",
          type: "available",
          start: "10:30",
          end: "12:30",
          durationMinutes: 120,
          title: "Khung giờ cuối buổi sáng",
        },
        {
          id: "free-3",
          type: "available",
          start: "13:30",
          end: "15:30",
          durationMinutes: 120,
          title: "Khung giờ đầu buổi chiều",
        },
        {
          id: "free-4",
          type: "available",
          start: "16:00",
          end: "18:00",
          durationMinutes: 120,
          title: "Khung giờ cuối buổi chiều",
        },
      ];
    }

    const sorted = [...occupiedSlots].sort(
      (a, b) =>
        parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime),
    );

    const result: UnifiedSlot[] = [];
    let cursor = DAY_START;

    sorted.forEach((slot, idx) => {
      const slotStart = parseTimeToMinutes(slot.startTime);
      const slotEnd = parseTimeToMinutes(slot.endTime);
      const slotBlocked = parseTimeToMinutes(slot.blockedUntil);

      if (slotStart - cursor >= 30) {
        result.push({
          id: `avail-before-${idx}`,
          type: "available",
          start: formatMinutesToTime(cursor),
          end: formatMinutesToTime(slotStart),
          durationMinutes: slotStart - cursor,
          title: "Khung giờ trống sẵn sàng",
        });
      }

      result.push({
        id: slot.id || `occupied-${idx}`,
        type: "occupied",
        start: formatIsoToTime(slot.startTime),
        end: formatIsoToTime(slot.endTime),
        blockedUntil: formatIsoToTime(slot.blockedUntil),
        title: slot.title || "Cuộc họp doanh nghiệp",
        durationMinutes: Math.max(0, slotEnd - slotStart),
      });

      cursor = Math.max(cursor, slotBlocked);
    });

    if (DAY_END - cursor >= 30) {
      result.push({
        id: "avail-end",
        type: "available",
        start: formatMinutesToTime(cursor),
        end: formatMinutesToTime(DAY_END),
        durationMinutes: DAY_END - cursor,
        title: "Khung giờ trống cuối ngày",
      });
    }

    return result;
  };

  const unifiedSlots = getChronologicalSlots();

  const applyQuickSlot = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  const displayDateLabel = (() => {
    try {
      const [y, m, d] = date.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return date;
    }
  })();

  // Tính thời lượng và ước tính tổng tiền
  const calculateTotal = () => {
    if (!startTime || !endTime || !room) return null;
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const hours = endH + endM / 60 - (startH + startM / 60);
    if (hours <= 0) return null;
    return {
      hours,
      total: hours * Number(room.hourlyRate),
    };
  };

  const estimate = calculateTotal();

  // 2. Xử lý gửi form đặt phòng
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning(
        "Vui lòng đăng nhập tài khoản doanh nghiệp trước khi đặt phòng!",
      );
      navigate("/login");
      return;
    }

    if (!title || !date || !startTime || !endTime) {
      toast.warning("Vui lòng nhập đầy đủ thông tin cuộc họp!");
      return;
    }

    if (hasConflict) {
      toast.error(
        "Khung giờ này đã bị trùng với cuộc họp khác hoặc vướng thời gian dọn dẹp kỹ thuật.",
      );
      return;
    }

    if (!estimate || estimate.hours <= 0) {
      toast.warning("Giờ kết thúc cuộc họp phải lớn hơn giờ bắt đầu!");
      return;
    }

    try {
      setBookingLoading(true);
      const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

      await bookingRequest.create({
        roomId: room?.id,
        title: title,
        startTime: startDateTime,
        endTime: endDateTime,
        participantCount: Number(participantCount),
      });

      toast.success("Chúc mừng! Cuộc họp của bạn đã được đặt thành công.");
      navigate("/my-bookings");
    } catch (err: any) {
      // Bắt lỗi 409 Conflict (đụng độ đồng thời)
      if (err?.response?.status === 409 || err?.status === 409) {
        // 1. Tự động làm mới lịch trống tức thì
        fetchOccupiedSlots();

        // 2. Hiển thị thông báo Toast cảnh báo lịch sự
        const msg =
          err.message ||
          "Phòng họp vừa được một đơn vị khác hoàn tất đăng ký trước bạn vài giây. Vui lòng chọn khung giờ khác!";
        setBookingMessage(msg);
        toast.warning(msg);
        return;
      }

      if (err instanceof ApiError) {
        setBookingMessage(err.message);
        toast.error(err.message);
      } else {
        setBookingMessage("Lỗi kết nối khi gửi thông tin đặt phòng.");
        toast.error("Lỗi kết nối khi gửi thông tin đặt phòng.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col text-stone-800">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-9 w-9 border-2 border-[#c59b48] border-t-transparent mb-3"></div>
          <p className="text-stone-500 text-sm font-light">
            Đang chuẩn bị thông tin không gian...
          </p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col text-stone-800">
        <Navbar />
        <div className="container mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="bg-red-50/80 text-red-700 p-8 rounded-2xl border border-red-200/90 max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-2 font-serif">Thông báo</h3>
            <p className="text-sm mb-5 text-red-600">
              {error || "Không tìm thấy dữ liệu không gian họp."}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 bg-[#0b1220] text-[#e6c87e] px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#141f36] transition"
            >
              <ArrowLeft size={14} /> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const seed = room.id.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-20 text-stone-800">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 mt-8">
        {/* Navigation Breadcrumb */}
        <Link
          to="/"
          className="text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1.5 mb-6 transition w-max"
        >
          <ArrowLeft size={14} />
          <span>Tất cả không gian</span>
        </Link>

        {/* Header Chi tiết */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="bg-[#0b1220] text-[#f3dfb2] border border-[#c59b48]/30 px-3 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.14em]">
                {room.roomType || "Executive Boardroom"}
              </span>
              <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#c59b48]" /> Đạt chuẩn
                doanh nghiệp
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-stone-900 tracking-tight mb-2">
              {room.name}
            </h1>
            <p className="text-xs text-stone-500 flex items-center gap-1.5 font-light">
              <MapPin size={14} className="text-[#c59b48]" />
              <span>{room.location || "Tòa nhà văn phòng đối tác"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto bg-white px-3.5 py-2 rounded-2xl border border-stone-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className="text-right">
              <div className="text-xs font-semibold text-stone-800 flex items-center justify-end gap-1">
                <span>Xuất sắc</span>
                <Star size={12} className="text-[#c59b48] fill-[#c59b48]" />
              </div>
              <div className="text-[10px] text-stone-400 font-light">
                Đánh giá doanh nghiệp
              </div>
            </div>
            <div className="bg-[#c59b48] text-[#0b1220] rounded-xl text-base font-bold w-10 h-10 flex items-center justify-center">
              5.0
            </div>
          </div>
        </div>

        {/* Thư viện ảnh bố cục tạp chí */}
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[380px] sm:h-[440px] mb-10 rounded-2xl overflow-hidden border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="col-span-2 row-span-2 overflow-hidden bg-stone-100">
            <img
              src={`https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop&sig=${seed}1`}
              alt="Main View"
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-700 cursor-pointer"
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden bg-stone-100">
            <img
              src={`https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=400&auto=format&fit=crop&sig=${seed}2`}
              alt="Detail 1"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden bg-stone-100">
            <img
              src={`https://images.unsplash.com/photo-1572025442646-866d16c84a54?q=80&w=400&auto=format&fit=crop&sig=${seed}3`}
              alt="Detail 2"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden bg-stone-100">
            <img
              src={`https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=400&auto=format&fit=crop&sig=${seed}4`}
              alt="Detail 3"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden bg-stone-100">
            <img
              src={`https://images.unsplash.com/photo-1505409859467-3a796fd5798e?q=80&w=400&auto=format&fit=crop&sig=${seed}5`}
              alt="Detail 4"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Nội dung chính chia 2 cột */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cột trái: Thông tin phòng & Tiện nghi */}
          <div className="lg:w-2/3">
            <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-8">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a67c2e] block mb-2">
                Không Gian Làm Việc
              </span>
              <h2 className="text-xl font-serif font-normal text-stone-900 mb-4">
                Thiết Kế Đẳng Cấp Cho Các Cuộc Họp Trọng Yếu
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-light text-justify">
                Được bài trí với tiêu chuẩn cách âm cao cấp, đón trọn ánh sáng
                tự nhiên cùng hạ tầng công nghệ hội thảo trực tuyến đồng bộ.
                Không gian lý tưởng cho các cuộc họp hội đồng quản trị, ký kết
                hợp tác chiến lược hoặc các buổi workshop chuyên sâu của đội
                ngũ.
              </p>

              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400 mb-4">
                Hạ Tầng & Tiện Ích Tích Hợp
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                  <div className="w-8 h-8 rounded-lg bg-[#c59b48]/10 text-[#c59b48] flex items-center justify-center shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                      Quy mô
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      Sức chứa {room.capacity} thành viên
                    </span>
                  </div>
                </div>

                {room.hasProjector && (
                  <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                    <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                      <Monitor size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                        Trình chiếu
                      </span>
                      <span className="text-xs font-semibold text-stone-800">
                        Màn hình LED 4K / Máy chiếu
                      </span>
                    </div>
                  </div>
                )}

                {room.hasWhiteboard && (
                  <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                    <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                      <Presentation size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                        Thảo luận
                      </span>
                      <span className="text-xs font-semibold text-stone-800">
                        Bảng kính & Bút dạ viết
                      </span>
                    </div>
                  </div>
                )}

                {room.hasVideoConference && (
                  <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                    <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                      <Video size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                        Trực tuyến
                      </span>
                      <span className="text-xs font-semibold text-stone-800">
                        Hội nghị truyền hình (Zoom/Teams)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                  <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                    <Wifi size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                      Kết nối
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      Wifi chuyên dụng 1Gbps
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-stone-700 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                  <div className="w-8 h-8 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center shrink-0">
                    <Coffee size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                      Dịch vụ
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      Trà & Cà phê hạt chọn lọc
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Lịch Hoạt Động & Chuỗi Khung Giờ Họp (Atelier Quiet Luxury) */}
            <div className="bg-[#faf8f5] rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-[0_8px_32px_rgba(15,23,42,0.03)]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-7 h-7 rounded-lg bg-[#c59b48]/15 text-[#9c7526] flex items-center justify-center shrink-0">
                      <Clock size={16} />
                    </span>
                    <h2 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
                      Lịch Hoạt Động & Thời Gian Biểu
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 font-light">
                    Các khung giờ họp được sắp xếp theo chuỗi thời gian liên
                    tục. Nhấp vào khung giờ trống để tự động điền vào form.
                  </p>
                </div>

                {/* Legend tinh tế */}
                <div className="flex items-center gap-4 text-xs font-light text-stone-600 bg-white/90 px-3.5 py-1.5 rounded-xl border border-stone-200/60 self-start sm:self-auto shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#c59b48]"></span>
                    <span className="text-[11px] font-medium text-stone-700">
                      Khả dụng
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-300"></span>
                    <span className="text-[11px] font-medium text-stone-500">
                      Đã giữ chỗ
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Thanh Chọn Ngày Nằm Ngang (Horizontal Date Ribbon) */}
              <div className="py-5 border-b border-stone-200/60">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Chọn ngày xem lịch:
                  </span>
                  <span className="text-xs font-medium text-stone-700 capitalize">
                    {displayDateLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {dateTabs.map((tab) => {
                    const isActive = date === tab.date;
                    return (
                      <button
                        key={tab.date}
                        type="button"
                        onClick={() => setDate(tab.date)}
                        className={`flex flex-col items-center justify-center min-w-[92px] px-3 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer border ${
                          isActive
                            ? "bg-[#0b1220] border-[#0b1220] text-[#e6c87e] shadow-sm ring-1 ring-[#c59b48]/30"
                            : "bg-white border-stone-200/80 text-stone-700 hover:bg-stone-100/70 hover:border-stone-300"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? "text-[#e6c87e]/80" : "text-stone-400"}`}
                        >
                          {tab.weekday}
                        </span>
                        <span className="font-serif font-bold text-sm mt-0.5">
                          {tab.dayMonth}
                        </span>
                      </button>
                    );
                  })}

                  {/* Nút chọn ngày tùy chỉnh */}
                  <div className="relative flex items-center shrink-0">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      title="Chọn ngày khác"
                      className="text-xs bg-white text-stone-700 border border-stone-200/80 rounded-xl px-3 py-3 outline-none cursor-pointer focus:border-[#c59b48] hover:bg-stone-100/70"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Dải Danh Sách Nằm Ngang Từng Khung Giờ (Horizontal Slot Carousel) */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-serif font-bold text-stone-900">
                      Chuỗi Khung Giờ Trong Ngày
                    </span>
                    <span className="text-[11px] text-stone-400 ml-2 font-light">
                      ({unifiedSlots.length} mốc thời gian)
                    </span>
                  </div>

                  {/* Controls cuộn ngang */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => scrollSlots("left")}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200/80 hover:bg-stone-100 flex items-center justify-center text-stone-600 transition cursor-pointer"
                      title="Cuộn sang trái"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollSlots("right")}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200/80 hover:bg-stone-100 flex items-center justify-center text-stone-600 transition cursor-pointer"
                      title="Cuộn sang phải"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="py-12 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-[#c59b48] border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang cập nhật danh sách khung giờ...</span>
                  </div>
                ) : (
                  <div
                    ref={slotScrollRef}
                    className="flex flex-row overflow-x-auto gap-3.5 pb-4 pt-1 snap-x scrollbar-thin scroll-smooth"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {unifiedSlots.map((slot) => {
                      const isOccupied = slot.type === "occupied";
                      const isSelected =
                        !isOccupied &&
                        startTime === slot.start &&
                        endTime === slot.end;

                      return (
                        <div
                          key={slot.id}
                          className={`min-w-[270px] md:min-w-[290px] shrink-0 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 snap-start border ${
                            isOccupied
                              ? "bg-white/80 border-stone-200/90 text-stone-700"
                              : isSelected
                                ? "bg-[#0b1220] border-[#c59b48] text-white shadow-lg ring-1 ring-[#c59b48]/40"
                                : "bg-white border-stone-200/90 hover:border-[#c59b48]/70 hover:shadow-[0_8px_24px_rgba(197,155,72,0.08)]"
                          }`}
                        >
                          {/* Header của thẻ */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            {isOccupied ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-stone-100 text-stone-500 border border-stone-200/60">
                                Đã Giữ Chỗ
                              </span>
                            ) : isSelected ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#c59b48] text-[#0b1220]">
                                Đang Chọn
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#faf6ee] text-[#9c7526] border border-[#c59b48]/30">
                                Khả Dụng
                              </span>
                            )}

                            <span
                              className={`text-[11px] font-serif ${isSelected ? "text-[#e6c87e]" : "text-stone-400"}`}
                            >
                              {(slot.durationMinutes / 60).toFixed(1)} giờ
                            </span>
                          </div>

                          {/* Khung giờ lớn */}
                          <div
                            className={`font-serif text-xl font-bold tracking-tight mb-2 ${isSelected ? "text-white" : "text-stone-900"}`}
                          >
                            {slot.start} — {slot.end}
                          </div>

                          {/* Nội dung chi tiết */}
                          {isOccupied ? (
                            <div className="space-y-3">
                              <p className="text-xs font-medium text-stone-700 line-clamp-2 min-h-[34px] leading-relaxed">
                                {slot.title}
                              </p>
                              <div className="pt-2.5 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
                                <span>Khử khuẩn bàn giao:</span>
                                <span className="font-semibold text-stone-600">
                                  đến {slot.blockedUntil}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p
                                className={`text-xs min-h-[34px] leading-relaxed ${isSelected ? "text-stone-300 font-light" : "text-stone-500 font-light"}`}
                              >
                                Không gian hoàn toàn trống, sẵn sàng tiếp nhận
                                cuộc họp.
                              </p>
                              <div className="pt-2.5 border-t border-stone-100">
                                <button
                                  type="button"
                                  onClick={() =>
                                    applyQuickSlot(slot.start, slot.end)
                                  }
                                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                                    isSelected
                                      ? "bg-[#c59b48] text-[#0b1220]"
                                      : "bg-[#0b1220] hover:bg-[#152138] text-[#e6c87e]"
                                  }`}
                                >
                                  <span>
                                    {isSelected
                                      ? "Đã chọn khung giờ này"
                                      : "Chọn khung giờ này"}
                                  </span>
                                  <ArrowRight size={13} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Danh Sách Dòng Ngang Tổng Hợp (Detailed Horizontal Row Stream) */}
              <div className="mt-6 pt-5 border-t border-stone-200/60">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Chi tiết trình tự theo giờ
                  </span>
                  <span className="text-[11px] text-stone-400 font-light">
                    Thời gian chuẩn 08:00 — 20:00
                  </span>
                </div>

                <div className="space-y-2">
                  {unifiedSlots.map((slot) => {
                    const isOccupied = slot.type === "occupied";
                    const isSelected =
                      !isOccupied &&
                      startTime === slot.start &&
                      endTime === slot.end;

                    return (
                      <div
                        key={`row-${slot.id}`}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                          isOccupied
                            ? "bg-white/60 border-stone-200/70 text-stone-700"
                            : isSelected
                              ? "bg-[#0b1220] border-[#c59b48] text-white shadow-xs"
                              : "bg-white border-stone-200/70 hover:border-[#c59b48]/40 hover:bg-[#fcfbf9]"
                        }`}
                      >
                        {/* Time & Title */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-serif shrink-0 ${
                              isOccupied
                                ? "bg-stone-100 text-stone-600"
                                : isSelected
                                  ? "bg-[#c59b48] text-[#0b1220]"
                                  : "bg-[#faf6ee] text-[#9c7526]"
                            }`}
                          >
                            {slot.start} — {slot.end}
                          </div>

                          <div>
                            <span
                              className={`text-xs font-medium block ${isSelected ? "text-white" : "text-stone-800"}`}
                            >
                              {isOccupied
                                ? slot.title
                                : "Khung giờ trống khả dụng"}
                            </span>
                            {isOccupied && (
                              <span className="text-[10px] text-stone-400 font-light block">
                                Dọn dẹp & bàn giao lúc {slot.blockedUntil}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action / Badge */}
                        <div className="shrink-0 flex items-center self-end sm:self-auto">
                          {isOccupied ? (
                            <span className="text-[11px] font-medium text-stone-400 bg-stone-100/80 px-2.5 py-1 rounded-md">
                              Đã giữ chỗ
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                applyQuickSlot(slot.start, slot.end)
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? "bg-[#e6c87e] text-[#0b1220]"
                                  : "bg-stone-100 hover:bg-[#0b1220] hover:text-[#e6c87e] text-stone-700"
                              }`}
                            >
                              <span>
                                {isSelected ? "Đã chọn" : "Đặt giờ này"}
                              </span>
                              <ArrowRight size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Form Đặt phòng tinh tế */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sticky top-24 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
              <div className="mb-5 pb-4 border-b border-stone-100">
                <span className="text-[10px] uppercase tracking-[0.16em] text-stone-400 font-semibold block mb-1">
                  Giá Thuê Niêm Yết
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-stone-900 tracking-tight">
                    {Number(room.hourlyRate).toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs text-stone-400 font-light">
                    /giờ
                  </span>
                </div>
              </div>

              <form
                onSubmit={handleBooking}
                className="flex flex-col gap-4 mb-5"
              >
                {bookingMessage && (
                  <div className="bg-red-50/90 text-red-700 text-xs p-3 rounded-xl border border-red-200 text-center">
                    {bookingMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Mục đích cuộc họp
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Họp Ban Giám Đốc Q3"
                    className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Ngày họp
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Bắt đầu
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Kết thúc
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Cảnh báo trùng lịch hoặc xác nhận khả dụng */}
                {hasConflict && (
                  <div className="bg-[#fdf6f5] border border-[#f2dedd] p-3.5 rounded-xl flex items-start gap-2.5 text-[#8c3e38] text-xs">
                    <AlertTriangle
                      size={15}
                      className="shrink-0 text-[#b54a43] mt-0.5"
                    />
                    <div>
                      <span className="font-semibold block font-serif text-[12px]">
                        Khung giờ bị trùng lịch
                      </span>
                      <span className="text-[11px] text-[#9b514a] mt-0.5 block leading-relaxed font-light">
                        Khoảng thời gian này đã có người đặt trước hoặc vướng
                        thời gian dọn dẹp kỹ thuật ({cleanupTimeMinutes} phút).
                        Vui lòng chọn khung giờ khác từ bảng lịch bên cạnh.
                      </span>
                    </div>
                  </div>
                )}

                {!hasConflict && startTime && endTime && estimate && (
                  <div className="flex items-center gap-2 text-[#2d5937] bg-[#f5f9f5] border border-[#d6e6d7] px-3.5 py-2.5 rounded-xl text-xs font-medium">
                    <CheckCircle2
                      size={14}
                      className="text-[#3c7a4b] shrink-0"
                    />
                    <span>Khung giờ khả dụng & sẵn sàng đặt</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Số người tham dự (Tối đa {room.capacity})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={room.capacity}
                    required
                    value={participantCount}
                    onChange={(e) =>
                      setParticipantCount(Number(e.target.value))
                    }
                    className="w-full bg-stone-50/50 border border-stone-200/90 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c59b48] focus:bg-white transition text-stone-800"
                  />
                </div>

                {/* Dự toán chi phí thanh lịch */}
                {estimate && (
                  <div className="bg-[#fbf9f5] border border-[#c59b48]/30 p-3.5 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between text-stone-500">
                      <span>Thời lượng dự kiến:</span>
                      <span className="font-medium text-stone-700">
                        {estimate.hours.toFixed(1)} giờ
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1.5 border-t border-[#c59b48]/20 text-stone-900 font-semibold">
                      <span>Tổng phí ước tính:</span>
                      <span className="text-base text-[#0b1220]">
                        {estimate.total.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading || hasConflict}
                  className={`w-full py-3.5 rounded-xl font-medium text-xs tracking-wide transition duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 active:scale-[0.99] mt-1 ${
                    hasConflict
                      ? "bg-stone-200/90 text-stone-400 border border-stone-300/80 cursor-not-allowed"
                      : "bg-[#0b1220] hover:bg-[#141f36] text-[#e6c87e] hover:text-white"
                  }`}
                >
                  {bookingLoading ? (
                    <div className="h-4 w-4 border-2 border-[#e6c87e] border-t-transparent rounded-full animate-spin"></div>
                  ) : hasConflict ? (
                    <>
                      <AlertTriangle size={15} className="text-[#b54a43]" />
                      <span>Khung Giờ Đã Bị Trùng Lịch</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      <span>Xác Nhận Đặt Lịch Họp</span>
                    </>
                  )}
                </button>
              </form>

              <ul className="text-[11px] text-stone-500 space-y-2 border-t border-stone-100 pt-4 font-light">
                <li className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-[#c59b48] shrink-0" />
                  <span>Trà, cà phê hạt và nước khoáng cao cấp sẵn sàng</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-[#c59b48] shrink-0" />
                  <span>
                    Chuyên viên kỹ thuật hỗ trợ setup trước giờ họp 15 phút
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
