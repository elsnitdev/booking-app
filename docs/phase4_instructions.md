# Giai Đoạn 4: Triển Khai Backend API & Đấu Nối Cho Admin Dashboard

Chào bạn! Ở bước trước, chúng ta đã hoàn thành toàn bộ **Giao diện Admin Dashboard (Frontend UI)** với 4 tab chức năng chuyên nghiệp:
1. **Tổng Quan & KPI**: Thống kê doanh thu, số cuộc họp, công suất phòng và doanh nghiệp đối tác.
2. **Quản Lý Lịch Đặt**: Danh sách toàn bộ cuộc họp, tìm kiếm thời gian thực, lọc và đổi trạng thái.
3. **Danh Mục Không Gian**: Quản lý phòng họp, Modal thêm/sửa phòng, bật/tắt khả dụng.
4. **Doanh Nghiệp Thành Viên**: Danh sách khách hàng doanh nghiệp đối tác.

Hiện tại, giao diện đang chạy với dữ liệu mô phỏng kết hợp với API phòng sẵn có. **Giai đoạn 4** là công đoạn bạn sẽ tự tay triển khai toàn bộ **Hệ thống Backend API cho Admin** bằng C# (.NET 10 Web API) và đấu nối trực tiếp vào cơ sở dữ liệu SQL Server (`BookingSystemDb`).

---

## 🎯 Mục Tiêu Cần Đạt Được
- [ ] **Bước 1:** Thiết lập tài khoản có quyền **Admin** trong Database.
- [ ] **Bước 2:** Tạo file DTO [`RoomManageDto.cs`](file:///d:/Booking-app/src/BookingApi/Models/DTOs/RoomManageDto.cs) và [`BookingStatusDto.cs`](file:///d:/Booking-app/src/BookingApi/Models/DTOs/BookingStatusDto.cs).
- [ ] **Bước 3:** Tạo mới [`AdminController.cs`](file:///d:/Booking-app/src/BookingApi/Controllers/AdminController.cs) với đầy đủ 7 endpoint quản trị:
  - `GET /api/Admin/stats` (Thống kê doanh thu & KPI)
  - `GET /api/Admin/bookings` (Toàn bộ lịch đặt có tìm kiếm/lọc)
  - `PUT /api/Admin/bookings/{id}/status` (Đổi trạng thái lịch họp)
  - `GET /api/Admin/rooms` (Toàn bộ phòng họp)
  - `POST /api/Admin/rooms` (Thêm phòng họp mới)
  - `PUT /api/Admin/rooms/{id}` (Chỉnh sửa thông tin phòng họp)
  - `PUT /api/Admin/rooms/{id}/toggle-status` (Bật / Tắt hoạt động)
  - `GET /api/Admin/users` (Danh sách khách hàng doanh nghiệp)
- [ ] **Bước 4:** Cập nhật hàm gọi API trong file Frontend [`AdminDashboardPage.tsx`](file:///d:/Booking-app/src/booking-client/src/pages/AdminDashboardPage.tsx).
- [ ] **Bước 5:** Khởi chạy `dotnet run` và kiểm thử toàn diện luồng quản trị thực tế!

---

## BƯỚC 1: Thiết Lập Quyền Quản Trị Viên (Admin)

Mặc định khi đăng ký, tài khoản được gán `Role = "User"`. Để truy cập và thực thi các quyền quản trị, bạn cần nâng cấp tài khoản của mình thành `Role = "Admin"` trong cơ sở dữ liệu.

Bạn mở terminal PowerShell và chạy lệnh SQL sau (hoặc mở SQL Server Management Studio):

```powershell
Invoke-Sqlcmd -ServerInstance "ELSNIT\SQLEXPRESS02" -Database "BookingSystemDb" -Query "UPDATE Users SET Role = 'Admin' WHERE Username = 'tinsle0609@gmail.com';"
```

*(Mẹo: Bạn có thể kiểm tra lại bằng lệnh `SELECT Id, Username, Role FROM Users;` để đảm bảo cột `Role` đã hiển thị là `Admin`).*

---

## BƯỚC 2: Tạo Các DTO Quản Trị Ở Backend

Tạo mới 2 file DTO trong thư mục [`src/BookingApi/Models/DTOs`](file:///d:/Booking-app/src/BookingApi/Models/DTOs):

### 2.1. File `src/BookingApi/Models/DTOs/RoomManageDto.cs`
Dùng để nhận dữ liệu khi Admin thêm mới hoặc sửa thông tin phòng họp:

```csharp
using System.ComponentModel.DataAnnotations;

namespace BookingApi.Models.DTOs
{
    public class RoomManageDto
    {
        [Required(ErrorMessage = "Tên phòng không được để trống")]
        public string Name { get; set; } = string.Empty;

        [Range(2, 200, ErrorMessage = "Sức chứa tối thiểu 2 người")]
        public int Capacity { get; set; }

        public string RoomType { get; set; } = "Executive Boardroom";

        [Range(0, 100000000, ErrorMessage = "Giá thuê không hợp lệ")]
        public decimal HourlyRate { get; set; }

        public string Location { get; set; } = string.Empty;

        public bool HasProjector { get; set; } = true;

        public bool HasWhiteboard { get; set; } = true;

        public bool HasVideoConference { get; set; } = false;

        public int CleanupTimeMinutes { get; set; } = 15;

        public bool IsActive { get; set; } = true;
    }
}
```

### 2.2. File `src/BookingApi/Models/DTOs/BookingStatusDto.cs`
Dùng khi Admin chuyển trạng thái cuộc họp:

```csharp
using System.ComponentModel.DataAnnotations;

namespace BookingApi.Models.DTOs
{
    public class BookingStatusDto
    {
        [Required]
        public string Status { get; set; } = "Confirmed"; // Confirmed, Pending, Completed, Cancelled
    }
}
```

---

## BƯỚC 3: Tạo `AdminController.cs`

Tạo mới file [`src/BookingApi/Controllers/AdminController.cs`](file:///d:/Booking-app/src/BookingApi/Controllers/AdminController.cs). Đây là controller trung tâm xử lý toàn bộ nghiệp vụ quản trị:

```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models.Entities;
using BookingApi.Models.DTOs;
using BookingApi.Models.Responses;
using Microsoft.AspNetCore.Authorization;

namespace BookingApi.Controllers
{
    [Authorize] // Yêu cầu phải đăng nhập
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // ================= 1. THỐNG KÊ & KPI TỔNG QUAN =================
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // Doanh thu từ các lịch họp đã xác nhận hoặc đã hoàn tất
            var totalRevenue = await _context.Bookings
                .Where(b => b.Status == "Confirmed" || b.Status == "Completed")
                .SumAsync(b => b.TotalPrice);

            var totalBookings = await _context.Bookings.CountAsync();
            var confirmedBookings = await _context.Bookings.CountAsync(b => b.Status == "Confirmed");
            var pendingBookings = await _context.Bookings.CountAsync(b => b.Status == "Pending");
            var completedBookings = await _context.Bookings.CountAsync(b => b.Status == "Completed");
            var cancelledBookings = await _context.Bookings.CountAsync(b => b.Status == "Cancelled");

            var totalRooms = await _context.Rooms.CountAsync();
            var activeRooms = await _context.Rooms.CountAsync(r => r.IsActive);
            var totalCorporateUsers = await _context.Users.CountAsync(u => u.Role == "User");

            // 5 lịch đặt phòng mới nhất
            var recentBookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Room)
                .OrderByDescending(b => b.CreatedAt)
                .Take(5)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    CompanyName = b.User != null ? b.User.CompanyName : "Doanh nghiệp",
                    ContactEmail = b.User != null ? b.User.Email : "",
                    RoomName = b.Room != null ? b.Room.Name : "",
                    RoomType = b.Room != null ? b.Room.RoomType : "",
                    Date = b.StartTime.ToString("dd/MM/yyyy"),
                    StartTime = b.StartTime.ToString("HH:mm"),
                    EndTime = b.EndTime.ToString("HH:mm"),
                    b.ParticipantCount,
                    b.TotalPrice,
                    b.Status
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResult(new
            {
                TotalRevenue = totalRevenue,
                TotalBookings = totalBookings,
                ConfirmedBookings = confirmedBookings,
                PendingBookings = pendingBookings,
                CompletedBookings = completedBookings,
                CancelledBookings = cancelledBookings,
                TotalRooms = totalRooms,
                ActiveRooms = activeRooms,
                TotalCorporateUsers = totalCorporateUsers,
                RecentBookings = recentBookings
            }, "Lấy dữ liệu thống kê thành công."));
        }

        // ================= 2. QUẢN LÝ TẤT CẢ LỊCH ĐẶT =================
        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings([FromQuery] string? status, [FromQuery] string? search)
        {
            var query = _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Room)
                .AsQueryable();

            // Lọc theo trạng thái
            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                query = query.Where(b => b.Status.ToLower() == status.ToLower());
            }

            // Tìm kiếm theo tên cuộc họp, tên công ty hoặc tên phòng
            if (!string.IsNullOrWhiteSpace(search))
            {
                var keyword = search.Trim().ToLower();
                query = query.Where(b =>
                    b.Title.ToLower().Contains(keyword) ||
                    (b.User != null && b.User.CompanyName.ToLower().Contains(keyword)) ||
                    (b.Room != null && b.Room.Name.ToLower().Contains(keyword)));
            }

            var bookings = await query
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new
                {
                    Id = "BK-" + b.Id.ToString().Substring(0, 6).ToUpper(),
                    RawId = b.Id,
                    b.Title,
                    CompanyName = b.User != null ? b.User.CompanyName : "Doanh nghiệp",
                    ContactEmail = b.User != null ? b.User.Email : "",
                    RoomName = b.Room != null ? b.Room.Name : "Phòng họp",
                    RoomType = b.Room != null ? b.Room.RoomType : "Hội thảo",
                    Date = b.StartTime.ToString("dd/MM/yyyy"),
                    StartTime = b.StartTime.ToString("HH:mm"),
                    EndTime = b.EndTime.ToString("HH:mm"),
                    b.ParticipantCount,
                    b.TotalPrice,
                    b.Status,
                    b.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResult(bookings, "Lấy danh sách lịch đặt thành công."));
        }

        // Cập nhật trạng thái lịch họp (Xác nhận / Hoàn tất / Hủy)
        [HttpPut("bookings/{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] BookingStatusDto dto)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound(ApiResponse<string>.ErrorResult("Không tìm thấy cuộc họp."));
            }

            booking.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult(booking.Id.ToString(), $"Đã cập nhật trạng thái sang '{dto.Status}'."));
        }

        // ================= 3. QUẢN LÝ DANH MỤC PHÒNG HỌP =================
        [HttpGet("rooms")]
        public async Task<IActionResult> GetAllRooms()
        {
            var rooms = await _context.Rooms
                .OrderByDescending(r => r.IsActive)
                .ThenBy(r => r.Name)
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResult(rooms, "Lấy danh mục phòng thành công."));
        }

        // Thêm phòng họp mới
        [HttpPost("rooms")]
        public async Task<IActionResult> CreateRoom([FromBody] RoomManageDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.ErrorResult("Dữ liệu nhập không hợp lệ."));
            }

            var room = new Room
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Capacity = dto.Capacity,
                RoomType = dto.RoomType,
                HourlyRate = dto.HourlyRate,
                Location = dto.Location,
                HasProjector = dto.HasProjector,
                HasWhiteboard = dto.HasWhiteboard,
                HasVideoConference = dto.HasVideoConference,
                CleanupTimeMinutes = dto.CleanupTimeMinutes,
                IsActive = dto.IsActive
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResult(room, "Tạo phòng họp mới thành công!"));
        }

        // Chỉnh sửa thông tin phòng họp
        [HttpPut("rooms/{id}")]
        public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] RoomManageDto dto)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound(ApiResponse<string>.ErrorResult("Không tìm thấy phòng họp cần sửa."));
            }

            room.Name = dto.Name;
            room.Capacity = dto.Capacity;
            room.RoomType = dto.RoomType;
            room.HourlyRate = dto.HourlyRate;
            room.Location = dto.Location;
            room.HasProjector = dto.HasProjector;
            room.HasWhiteboard = dto.HasWhiteboard;
            room.HasVideoConference = dto.HasVideoConference;
            room.CleanupTimeMinutes = dto.CleanupTimeMinutes;
            room.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.SuccessResult(room, "Cập nhật phòng họp thành công!"));
        }

        // Bật / Tắt trạng thái hoạt động của phòng
        [HttpPut("rooms/{id}/toggle-status")]
        public async Task<IActionResult> ToggleRoomStatus(Guid id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound(ApiResponse<string>.ErrorResult("Không tìm thấy phòng họp."));
            }

            room.IsActive = !room.IsActive;
            await _context.SaveChangesAsync();

            var statusStr = room.IsActive ? "Khả dụng" : "Tạm ngưng phục vụ";
            return Ok(ApiResponse<bool>.SuccessResult(room.IsActive, $"Đã chuyển phòng sang trạng thái: {statusStr}."));
        }

        // ================= 4. QUẢN LÝ DOANH NGHIỆP THÀNH VIÊN =================
        [HttpGet("users")]
        public async Task<IActionResult> GetCorporateUsers()
        {
            var users = await _context.Users
                .Where(u => u.Role == "User")
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.CompanyName,
                    u.Department,
                    u.Role,
                    TotalMeetings = u.Bookings.Count(),
                    TotalSpent = u.Bookings
                        .Where(b => b.Status == "Confirmed" || b.Status == "Completed")
                        .Sum(b => b.TotalPrice)
                })
                .OrderByDescending(u => u.TotalSpent)
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResult(users, "Lấy danh sách doanh nghiệp thành viên thành công."));
        }
    }
}
```

---

## BƯỚC 4: Đấu Nối Frontend Gọi Trực Tiếp API Backend

Trong file [`src/booking-client/src/pages/AdminDashboardPage.tsx`](file:///d:/Booking-app/src/booking-client/src/pages/AdminDashboardPage.tsx), bạn hãy kiểm tra và hoàn thiện các đoạn gọi API để lấy dữ liệu thực:

### 4.1. Tải Dữ Liệu Thống Kê & Lịch Đặt
Thay thế hàm tải mẫu bằng việc gọi API có truyền kèm JWT Token:

```typescript
const token = localStorage.getItem('token');

// 1. Tải dữ liệu KPI
const fetchStats = async () => {
  const res = await fetch(`${API_BASE_URL}/Admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (res.ok && data.data) {
    // Gán dữ liệu vào state
  }
};

// 2. Tải toàn bộ lịch đặt
const fetchBookings = async () => {
  const res = await fetch(`${API_BASE_URL}/Admin/bookings?status=${bookingFilter}&search=${bookingSearch}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (res.ok && data.data) {
    setBookings(data.data);
  }
};
```

### 4.2. Thao Tác Lưu Phòng & Đổi Trạng Thái
```typescript
// Thêm mới hoặc sửa phòng
const res = await fetch(editingRoom ? `${API_BASE_URL}/Admin/rooms/${editingRoom.id}` : `${API_BASE_URL}/Admin/rooms`, {
  method: editingRoom ? 'PUT' : 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: formName,
    capacity: Number(formCapacity),
    roomType: formType,
    hourlyRate: Number(formRate),
    location: formLocation,
    hasProjector: formProjector,
    hasWhiteboard: formWhiteboard,
    hasVideoConference: formVideo,
    isActive: true
  })
});
```

---

## BƯỚC 5: Kiểm Thử & Chạy Thử Toàn Diện

1. **Biên dịch Backend:**
   Mở terminal tại thư mục gốc backend và gõ:
   ```powershell
   cd d:\Booking-app\src\BookingApi
   dotnet build
   ```
   *(Đảm bảo kết quả hiển thị: `Build succeeded. 0 Warning(s). 0 Error(s)`)*

2. **Chạy Backend:**
   ```powershell
   dotnet run --launch-profile http
   ```
   *(API sẽ lắng nghe tại `http://localhost:5139`)*

3. **Chạy Frontend:**
   Mở thêm một cửa sổ terminal mới:
   ```powershell
   cd d:\Booking-app\src\booking-client
   npm run dev
   ```
   *(Client sẽ chạy tại `http://localhost:5173`)*

4. **Kiểm tra luồng hoạt động:**
   - Mở trình duyệt vào `http://localhost:5173/login`, đăng nhập tài khoản Admin của bạn (`tinsle0609@gmail.com`).
   - Nhấn vào nút **"Quản trị"** trên thanh Navbar (hoặc gõ `http://localhost:5173/admin`).
   - Kiểm tra xem 4 tab đã nhận dữ liệu thật từ cơ sở dữ liệu chưa.
   - Thử bấm nút **"Thêm Không Gian Mới"**, nhập tên phòng (VD: *Phòng Họp Hội Nghị Diamond*) và lưu lại -> Quay ra trang chủ Homepage kiểm tra xem phòng mới đã xuất hiện chưa!

---

💡 **Ghi chú:** Sau khi bạn code xong các file trên, hãy gửi phản hồi cho tôi, tôi sẽ cùng bạn kiểm tra biên dịch, chạy thử API và kiểm tra database để đảm bảo toàn bộ luồng hoạt động trơn tru nhất!
