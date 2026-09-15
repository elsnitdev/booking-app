# 🚀 Roadmap Phát triển Booking System API

Với tư cách là người hướng dẫn, tôi đã vạch ra cho bạn một lộ trình từng bước (To-do list) để hoàn thiện dự án này. Hãy đi từ tầng thấp nhất (Dữ liệu) lên tầng cao nhất (API) để đảm bảo nền tảng vững chắc.

## Giai đoạn 1: Thiết lập Database & Entity Framework Core
- [x] **Hoàn thiện các class Entities:** Mở các file trong `Models/Entities` (`User.cs`, `Room.cs`, `Booking.cs`) và khai báo các thuộc tính dựa trên Database Schema đã thiết kế.
- [x] **Cấu hình `AppDbContext`:** Khai báo các `DbSet` và thiết lập các ràng buộc quan hệ (Foreign Keys, MaxLength...) bằng Fluent API trong phương thức `OnModelCreating`.
- [x] **Cài đặt thư viện EF Core:** Chạy lệnh cài package NuGet:
  - `Microsoft.EntityFrameworkCore.SqlServer`
  - `Microsoft.EntityFrameworkCore.Tools`
- [x] **Kết nối Database:** Thêm `ConnectionStrings` vào file `appsettings.json` và đăng ký DbContext trong `Program.cs`.
- [x] **Tạo DB thực tế (Migration):** Chạy lệnh `dotnet ef migrations add InitialCreate` và `dotnet ef database update`.

## Giai đoạn 2: Phát triển Lớp Nghiệp vụ (Business Logic)
- [x] **Hoàn thiện DTOs:** Khai báo thuộc tính cho `BookingRequestDto.cs` (gồm RoomId, StartTime, EndTime).
- [x] **Viết Logic `BookingService`:**
  - Viết hàm kiểm tra phòng trống (Check Availability): Implement thuật toán chống Overlapping time.
  - Viết hàm tạo lịch đặt (Create Booking): Validate và lưu DB.
- [x] **Đăng ký Dependency Injection (DI):** Vào `Program.cs` thêm `builder.Services.AddScoped<IBookingService, BookingService>();`.

## Giai đoạn 3: Phát triển API (Controllers)
- [x] **`RoomsController`:** 
  - `GET /api/rooms` (Lấy danh sách phòng).
  - `POST /api/rooms` (Thêm phòng - Role Admin).
- [x] **`BookingsController`:** 
  - `POST /api/bookings/available` (Check phòng trống).
  - `POST /api/bookings` (Tạo lịch đặt).
  - `PUT /api/bookings/{id}/cancel` (Hủy lịch).

## Giai đoạn 4: Phân quyền và Bảo mật (JWT)
- [x] **Cài đặt JWT:** Cài package `Microsoft.AspNetCore.Authentication.JwtBearer`.
- [x] **Cấu hình Middleware:** Thiết lập thông số Token trong `appsettings.json` và gọi `AddAuthentication`, `AddJwtBearer` trong `Program.cs`.
- [x] **API Đăng nhập:** Tạo một `AuthController` để xử lý Login và cấp phát Token.
- [x] **Khóa API:** Dùng attribute `[Authorize]` để khóa các endpoint đặt lịch, yêu cầu user phải đăng nhập.

## Giai đoạn 5: Tối ưu Hóa và Xử lý Nâng cao
- [ ] **Xử lý Đụng độ (Concurrency):** Thêm trường `RowVersion` vào Entity để cấu hình Optimistic Concurrency Control, phòng trường hợp 2 người đặt chung 1 phòng ở cùng 1 giây.
- [ ] **Tác vụ Nền (Background Worker):** Code logic cho `BookingCleanupWorker.cs` để cứ vài phút tự quét DB và giải phóng các lịch "rác" hoặc quá hạn.
- [ ] **Kiểm thử (Testing):** Mở Swagger UI lên và test toàn bộ luồng.
