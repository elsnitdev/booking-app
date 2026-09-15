# Lộ trình học & Tài liệu tham khảo — Booking System API

> Tổng hợp dành cho sinh viên năm 3, có nền tảng MVC, cần cải thiện .NET để đủ khả năng phỏng vấn intern/fresher.
> Dựa trên README dự án Booking System API (C# ASP.NET Core Web API + EF Core + JWT).

---

## Đánh giá độ khó

| Mức độ               | Nội dung                                          | Ưu tiên                               |
| :------------------- | :------------------------------------------------ | :------------------------------------ |
| Nền tảng (bắt buộc)  | CRUD, MVC pattern, EF Core Code-First, JWT cơ bản | Cao                                   |
| Trọng tâm nghiệp vụ  | Thuật toán check overlap thời gian, validation    | Cao                                   |
| Nâng cao (điểm cộng) | Concurrency Control, Background Jobs              | Trung bình — làm sau khi phần trên ổn |

**Gợi ý:** không cần làm cả `SERIALIZABLE` + `SemaphoreSlim` + `Redis Distributed Lock` cùng lúc như README liệt kê. Chọn **Optimistic Concurrency với RowVersion** trước — dễ implement với EF Core nhất và là câu hỏi phỏng vấn phổ biến.

---

## Lộ trình 7 giai đoạn

### Giai đoạn 1: Nền tảng C# & ASP.NET Core Web API

Ôn lại OOP, async/await, dependency injection. Dựng project Web API rỗng, hiểu vòng đời request qua Middleware Pipeline, tạo Controller đầu tiên.
_Đây là kiến thức hầu như câu hỏi phỏng vấn intern nào cũng hỏi (DI là gì, scoped/singleton/transient khác nhau ra sao)._

### Giai đoạn 2: EF Core Code-First & thiết kế schema

Setup DbContext, tạo migration cho 3 bảng Users/Rooms/Bookings đúng như README. Thực hành quan hệ 1-N (User–Bookings, Room–Bookings), cấu hình Fluent API cho ràng buộc NOT NULL/UNIQUE.

### Giai đoạn 3: Luồng CRUD tài nguyên (Rooms)

Làm Admin CRUD phòng trước vì đơn giản nhất, giúp bạn quen luồng Controller → Service → Repository/DbContext → trả DTO. Thêm rule "không xóa phòng có lịch tương lai" để luyện validation logic.

### Giai đoạn 4: JWT Authentication & Role-based Authorization

Implement đăng ký/đăng nhập, sinh JWT, cấu hình middleware xác thực, dùng `[Authorize(Roles="Admin")]` để phân quyền.
_Câu hỏi kinh điển khi phỏng vấn: JWT gồm 3 phần gì, vì sao không lưu password plain text (BCrypt/Identity)._

### Giai đoạn 5: Thuật toán Time Overlapping (trọng tâm nghiệp vụ)

Implement API kiểm tra lịch trống bằng công thức trong README:

```
(ExistingStart < NewEnd AND ExistingEnd > NewStart)
```

Viết Unit Test cho case biên (chạm giờ, lồng nhau hoàn toàn, lồng một phần) — thể hiện tư duy logic rất tốt khi phỏng vấn.

### Giai đoạn 6: Concurrency Control (điểm cộng, làm sau khi ổn phần trên)

Bắt đầu với Optimistic Concurrency (RowVersion) trong EF Core — dễ code, dễ giải thích khi phỏng vấn hơn Pessimistic Locking. Chỉ thử SERIALIZABLE/SemaphoreSlim nếu còn thời gian, không bắt buộc phải có cả hai.

### Giai đoạn 7: Background Service (tùy chọn, làm cuối)

Dùng `BackgroundService` quét lịch quá hạn hoặc gửi nhắc nhở. Không khó về code nhưng thể hiện bạn hiểu Hosted Service — khái niệm nhiều sinh viên bỏ qua, sẽ là điểm khác biệt trong CV.

---

## Tài liệu tham khảo theo chủ đề

### Giai đoạn 1 — ASP.NET Core Web API cơ bản

- **Tutorial: Create a web API with ASP.NET Core** (Microsoft Learn)
  https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-8.0
  Hướng dẫn chính thức: dựng Web API đầu tiên với Controller, routing, model binding.

- **Build Web APIs with ASP.NET Core** (trang tổng hợp, Microsoft Learn)
  https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-9.0
  Dùng để tra cứu sâu: routing, model validation, error handling, versioning.

### Giai đoạn 2 — EF Core Code-First

- **Getting Started with EF Core - Code First** (Microsoft Learn)
  https://learn.microsoft.com/en-us/ef/core/get-started/overview/first-app?tabs=netcore-cli
  Hướng dẫn từ đầu: tạo model, DbContext, migration — áp dụng trực tiếp cho 3 bảng Users/Rooms/Bookings.

### Giai đoạn 4 — JWT Authentication

- **JWT Bearer Authentication in ASP.NET Core** (Microsoft Learn)
  https://learn.microsoft.com/en-us/aspnet/core/security/authentication/jwt-authn?view=aspnetcore-9.0
  Cấu hình JwtBearer middleware chuẩn, kèm ví dụ sinh và validate token.

### Giai đoạn 6 — Concurrency Control

- **Handling Concurrency Conflicts - EF Core** (Microsoft Learn)
  https://learn.microsoft.com/en-us/ef/core/saving/concurrency
  Tài liệu chính thức về Optimistic Concurrency với RowVersion/Timestamp — đúng giải pháp README đề xuất.

### Giai đoạn 7 — Background Service

- **Worker Services in .NET (BackgroundService / IHostedService)** (Microsoft Learn)
  https://learn.microsoft.com/en-us/dotnet/core/extensions/workers
  Giải thích rõ khái niệm BackgroundService vs IHostedService, kèm ví dụ code.

---

## Lưu ý từ góc nhìn PM

**Về kiến trúc — đừng over-engineer.** Ở mức đồ án sinh viên, không cần Repository Pattern + Unit of Work + CQRS phức tạp — chỉ cần Controller → Service layer → DbContext trực tiếp là đủ sạch và dễ giải thích khi phỏng vấn. Nhà tuyển dụng intern quan tâm bạn có hiểu _vì sao_ tách layer hơn là bạn có bao nhiêu layer.

**Về thứ tự ưu tiên khi thời gian có hạn.** Đảm bảo chắc chắn Giai đoạn 1–5 (CRUD, JWT, thuật toán overlap) chạy tốt và có test trước — đây là phần chấm điểm cao nhất khi phỏng vấn vì thể hiện tư duy logic nghiệp vụ. Concurrency Control và Background Job là "nice to have".

**Chuẩn bị phỏng vấn.** Sau mỗi giai đoạn, tự hỏi 2-3 câu "tại sao" (VD: tại sao dùng `RowVersion` thay vì lock cứng, tại sao query overlap lại viết theo công thức phủ định như README) — phỏng vấn intern/fresher .NET thường hỏi bạn giải thích quyết định thiết kế hơn là hỏi lý thuyết suông.
