# Giai Đoạn 3: Quản Lý Phiên Đăng Nhập & Trang Lịch Sử Đặt Phòng (My Bookings)

Chúc mừng bạn đã hoàn thành kết nối dữ liệu thành công ở Giai đoạn 2! Hiện tại người dùng đã có thể xem phòng và đặt phòng từ Database.

Tuy nhiên, sau khi đặt phòng xong, người dùng cần biết:
1. **Tôi đã đăng nhập chưa?** (Hiện tại Navbar vẫn luôn hiển thị 2 nút "Đăng nhập" và "Đăng ký" dù đã có token).
2. **Xem lại các phòng mình đã đặt ở đâu?** (Cần có trang Lịch sử cuộc họp).
3. **Làm sao để hủy lịch họp nếu kế hoạch thay đổi?**

Dưới đây là cẩm nang chi tiết để bạn tự tay triển khai code cho **Giai đoạn 3**. Sau khi bạn viết xong, tôi sẽ review code và chạy kiểm thử cùng bạn!

---

## 🎯 Mục Tiêu Cần Đạt Được
- [ ] **Backend:** Bổ sung API lấy danh sách booking của user đang đăng nhập (`GET /api/Bookings/my-bookings`).
- [ ] **Backend:** Bổ sung API hủy lịch đặt phòng (`PUT /api/Bookings/{id}/cancel`).
- [ ] **Frontend (Navbar):** Kiểm tra token, tự động đổi giao diện sang: hiển thị nút **"Lịch họp của tôi"** và nút **"Đăng xuất"**.
- [ ] **Frontend (Trang mới):** Xây dựng trang **`MyBookingsPage.tsx`** theo phong cách sang trọng để quản lý toàn bộ các phòng đã đặt.
- [ ] **Frontend (App.tsx):** Đăng ký Route `/my-bookings`.

---

## BƯỚC 1: Bổ Sung API Ở Backend

Mở file [`src/BookingApi/Controllers/BookingsController.cs`](file:///d:/Booking-app/src/BookingApi/Controllers/BookingsController.cs). Bạn hãy thêm 2 action mới vào trong class `BookingsController`:

### 1.1. API Lấy Danh Sách Lịch Họp Của Tôi (`GET /api/Bookings/my-bookings`)
Hàm này sẽ đọc mã `UserId` từ Token JWT của người dùng đang gửi yêu cầu, sau đó lấy toàn bộ booking của họ kèm thông tin phòng họp:

```csharp
[HttpGet("my-bookings")]
public async Task<IActionResult> GetMyBookings()
{
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
    {
        return Unauthorized(ApiResponse<object>.ErrorResult("Chưa đăng nhập."));
    }

    var bookings = await _context.Bookings
        .Include(b => b.Room) // Lấy kèm thông tin phòng họp để hiển thị tên phòng
        .Where(b => b.UserId == userId)
        .OrderByDescending(b => b.CreatedAt)
        .Select(b => new
        {
            b.Id,
            b.Title,
            b.StartTime,
            b.EndTime,
            b.ParticipantCount,
            b.TotalPrice,
            b.Status,
            b.CreatedAt,
            Room = new
            {
                b.Room.Id,
                b.Room.Name,
                b.Room.Location,
                b.Room.RoomType
            }
        })
        .ToListAsync();

    return Ok(ApiResponse<object>.SuccessResult(bookings, "Lấy danh sách đặt phòng thành công."));
}
```

### 1.2. API Hủy Đặt Phòng (`PUT /api/Bookings/{id}/cancel`)
Cho phép người dùng đổi trạng thái cuộc họp thành `"Cancelled"`:

```csharp
[HttpPut("{id}/cancel")]
public async Task<IActionResult> CancelBooking(Guid id)
{
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

    var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
    if (booking == null)
    {
        return NotFound(ApiResponse<string>.ErrorResult("Không tìm thấy thông tin đặt phòng."));
    }

    if (booking.Status == "Cancelled")
    {
        return BadRequest(ApiResponse<string>.ErrorResult("Cuộc họp này đã được hủy trước đó."));
    }

    booking.Status = "Cancelled";
    await _context.SaveChangesAsync();

    return Ok(ApiResponse<string>.SuccessResult(booking.Id.ToString(), "Hủy đặt phòng thành công."));
}
```

---

## BƯỚC 2: Cập Nhật `Navbar.tsx` Nhận Diện Đăng Nhập

Mở file [`src/booking-client/src/components/Navbar.tsx`](file:///d:/Booking-app/src/booking-client/src/components/Navbar.tsx):
- Kiểm tra xem trong `localStorage` có `token` hay không bằng `useState` / `useEffect`.
- Nếu **chưa có token**: Giữ nguyên nút "Đăng ký" và "Đăng nhập".
- Nếu **đã có token**: Hiển thị nút **"Lịch họp của tôi"** (`/my-bookings`) và nút **"Đăng xuất"** (khi nhấn sẽ `localStorage.removeItem("token")` và chuyển hướng về `/`).

**Gợi ý cấu trúc logic:**
```tsx
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Calendar, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    // ... Render giao diện tùy theo isLoggedIn ...
  );
}
```

---

## BƯỚC 3: Tạo Trang Quản Lý `MyBookingsPage.tsx`

Tạo file mới tại: **`src/booking-client/src/pages/MyBookingsPage.tsx`**.

Trang này sẽ:
1. Kiểm tra đăng nhập, nếu chưa có token thì chuyển về `/login`.
2. Dùng `useEffect` gọi `GET ${API_BASE_URL}/Bookings/my-bookings` với Header:
   ```ts
   headers: { 'Authorization': `Bearer ${token}` }
   ```
3. Hiển thị danh sách các cuộc họp bằng giao diện thẻ (Card) sang trọng gồm:
   - **Tên cuộc họp** (`booking.title`)
   - **Tên phòng & Vị trí** (`booking.room.name` - `booking.room.location`)
   - **Thời gian:** Ngày họp, giờ bắt đầu ➔ giờ kết thúc
   - **Số người & Chi phí:** `booking.participantCount`, `booking.totalPrice.toLocaleString('vi-VN')đ`
   - **Badge Trạng thái:** 
     - Màu xanh lá: `Confirmed` (Đã xác nhận)
     - Màu đỏ: `Cancelled` (Đã hủy)
   - **Nút "Hủy lịch họp":** Chỉ hiện khi `booking.status !== "Cancelled"`, bấm vào sẽ gọi API hủy.

---

## BƯỚC 4: Đăng Ký Route Trong `App.tsx`

Mở file [`src/booking-client/src/App.tsx`](file:///d:/Booking-app/src/booking-client/src/App.tsx) và thêm route mới:

```tsx
import MyBookingsPage from './pages/MyBookingsPage';

// Trong <Routes>:
<Route path="/my-bookings" element={<MyBookingsPage />} />
```

---

## 🏁 Khi Nào Bắt Đầu?
Bạn hãy mở các file trên và bắt đầu viết code nhé! 

Cứ thong thả code từng bước một:
1. Viết 2 API trong `BookingsController.cs` trước.
2. Cập nhật `Navbar.tsx`.
3. Tạo file `MyBookingsPage.tsx` và thêm route vào `App.tsx`.

Sau khi bạn hoàn thành hoặc nếu gặp bất kỳ vướng mắc gì trong lúc viết, hãy nhắn lại cho tôi. Tôi sẽ vào review chi tiết mã nguồn và chạy test thử luồng đặt phòng ➔ xem lịch ➔ hủy phòng cùng bạn! Chúc bạn làm việc hiệu quả!
