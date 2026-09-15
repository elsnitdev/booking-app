# Cấu trúc dự án Booking System API

Dự án này được thiết kế theo mô hình phân lớp (N-Tier Architecture) giản lược, rất phù hợp cho một dự án cá nhân hoặc dự án quy mô vừa và nhỏ. Việc gom chung vào một Project nhưng phân tách qua các thư mục giúp bạn dễ dàng code, tránh sự cồng kềnh của Clean Architecture mà vẫn giữ được tiêu chí Phân tách trách nhiệm (Separation of Concerns).

## Sơ đồ cấu trúc thư mục

```text
Booking-app/
├── README.md                           # Tài liệu tổng quan của dự án
├── docs/                               # Thư mục chứa các tài liệu liên quan
│   └── project-structure.md            # Mô tả cấu trúc dự án (file này)
└── src/                                # Thư mục mã nguồn
    └── BookingApi/                     # Project chính ASP.NET Core Web API
        ├── BookingApi.csproj           # Cấu hình project .NET
        ├── Program.cs                  # Entry point, cấu hình Middleware, Dependency Injection
        ├── appsettings.json            # Cấu hình biến môi trường (chuỗi kết nối DB, JWT secret)
        │
        ├── BackgroundTasks/            # Chứa các Hosted Services (tác vụ ngầm)
        │   └── BookingCleanupWorker.cs # Job tự động dọn dẹp các lịch quá hạn
        │
        ├── Controllers/                # Lớp API (Presentation Layer)
        │   ├── BookingsController.cs   # API endpoints xử lý luồng đặt/hủy lịch
        │   └── RoomsController.cs      # API endpoints quản lý tài nguyên (phòng)
        │
        ├── Data/                       # Lớp Data Access
        │   └── AppDbContext.cs         # DbContext của Entity Framework Core
        │
        ├── Models/                     # Các lớp định nghĩa dữ liệu
        │   ├── DTOs/                   # Data Transfer Objects (truyền tải dữ liệu với Client)
        │   │   └── BookingRequestDto.cs
        │   └── Entities/               # Cấu trúc bảng trong Database
        │       ├── Booking.cs
        │       ├── Room.cs
        │       └── User.cs
        │
        └── Services/                   # Lớp Business Logic (Xử lý nghiệp vụ cốt lõi)
            ├── BookingService.cs       # Logic kiểm tra trùng lịch, giao dịch DB
            └── IBookingService.cs      # Interface phục vụ Dependency Injection
```

## Giải thích chi tiết các thành phần

1. **Controllers (Lớp giao tiếp):** 
   - Chịu trách nhiệm hứng các Request HTTP từ Client (React, Postman), validate dữ liệu đầu vào cơ bản và trả về Response chuẩn (JSON + HTTP Status Code).
   - Tuyệt đối không viết logic kiểm tra (trùng lịch, tính tiền...) ở đây. Controller sẽ gọi qua lớp `Services`.

2. **Services (Lớp nghiệp vụ):**
   - Đây là "trái tim" của hệ thống, chứa các xử lý phức tạp nhất. 
   - Sử dụng các Interface như `IBookingService` để dễ dàng viết Unit Test (sử dụng Mock) mà không cần chọc trực tiếp vào Database.

3. **Data & Entities (Lớp dữ liệu):**
   - Các class trong `Entities` map trực tiếp với các bảng SQL.
   - `AppDbContext` là cầu nối giữa ứng dụng và SQL Server để thực thi các lệnh CRUD thông qua Entity Framework Core.

4. **DTOs (Data Transfer Object):**
   - Đóng vai trò làm bộ lọc. Khi User gửi yêu cầu tạo Booking, họ dùng `BookingRequestDto` để chỉ gửi những thông tin cần thiết. Hệ thống không bao giờ trả thẳng `Entity` ra ngoài để bảo mật thông tin (tránh rò rỉ Password, hoặc các dữ liệu nhạy cảm).

5. **BackgroundTasks:**
   - Các tác vụ chạy ngầm định kỳ (Background Workers) mà không cần User phải trigger. Rất hữu ích để dọn dẹp hệ thống, gửi email thông báo nhắc lịch...

Kiến trúc này giúp bạn dễ dàng theo dõi lỗi, cô lập thay đổi, và khi dự án lớn lên hoàn toàn có thể bóc tách `Services` và `Data` ra thành các Project (Class Library) độc lập.
