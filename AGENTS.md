# Quy tắc làm việc với AI — Booking App

## Phạm vi và nguồn sự thật

- Các quy tắc này áp dụng cho toàn bộ repository.
- Đây là dự án học tập dùng ASP.NET Core Web API, Entity Framework Core, SQL Server, React và TypeScript.
- Khi có mâu thuẫn, ưu tiên theo thứ tự: yêu cầu hiện tại của người dùng, quy tắc trong file này, code/config/migrations hiện hành, rồi đến tài liệu mô tả.
- Nếu các nguồn vẫn mâu thuẫn hoặc quyết định có thể đổi API, schema hay hành vi nghiệp vụ, nêu rõ mâu thuẫn và hỏi người dùng trước khi tiếp tục.
- Chỉ đọc những file cần cho nhiệm vụ. Đọc `docs/ai-workflow.md` khi hướng dẫn một nhiệm vụ nhiều bước, sửa bug, thêm tính năng, thay đổi API/database hoặc review code; không bắt buộc đọc cho câu hỏi nhỏ.

## Chế độ học tập mặc định

- Mục tiêu là giúp người dùng hiểu và tự viết code.
- Khi người dùng hỏi cách làm, yêu cầu giải thích hoặc xin hướng dẫn: giải thích mục tiêu và lý do, chỉ ra file liên quan, đưa một bước nhỏ để người dùng thực hiện, rồi review kết quả trước khi chuyển bước. Không tự sửa file.
- Chỉ trực tiếp thay đổi code khi người dùng yêu cầu rõ, ví dụ: “hãy triển khai”, “hãy sửa file”, “làm giúp tôi” hoặc tương đương.
- Khi được yêu cầu triển khai, hoàn thành đúng phạm vi, giải thích các quyết định quan trọng và kiểm chứng phần bị ảnh hưởng. Không dừng lại chỉ để chờ xác nhận cho các bước kỹ thuật thông thường đã nằm trong phạm vi yêu cầu.
- Nếu chưa rõ người dùng muốn tự code hay muốn AI triển khai và lựa chọn đó làm thay đổi đáng kể cách xử lý, hỏi một câu ngắn để xác nhận.

## Giới hạn thay đổi

- Không tự ý refactor lớn, đổi public API, đổi database schema, thêm framework/pattern hoặc mở rộng ngoài yêu cầu.
- Không chỉnh sửa trực tiếp nội dung sinh tự động trong `bin/`, `obj/`, `node_modules/`, migration đã sinh hoặc `AppDbContextModelSnapshot.cs`.
- Với thay đổi entity/schema, phải giải thích tác động dữ liệu và migration trước. Chỉ tạo hoặc chạy migration khi người dùng yêu cầu rõ; dùng công cụ EF Core thay vì sửa migration/snapshot bằng tay.
- Không xóa hoặc ghi đè thay đổi sẵn có của người dùng. Chỉ sửa file liên quan trực tiếp đến nhiệm vụ.
- Không đưa JWT key, password, token, connection string thật hoặc secret khác vào code, tài liệu, log hay câu trả lời. Dùng biến môi trường, user secrets hoặc placeholder phù hợp.

## Kiến trúc và nghiệp vụ

- Giữ luồng backend: Controller → Service → DbContext. Controller xử lý HTTP, authorization và validation ở biên; business logic đặt phòng thuộc Service.
- Dùng DTO ở biên API. Không trả trực tiếp Entity nếu có thể làm lộ dữ liệu nhạy cảm hoặc ràng buộc persistence.
- Frontend gọi API qua `src/booking-client/src/requests` và `src/booking-client/src/lib/httpClient.ts`; cập nhật kiểu tương ứng trong `src/booking-client/src/types` khi contract thay đổi.
- Không tự thêm Repository, Unit of Work, CQRS hoặc tầng trừu tượng mới nếu người dùng chưa yêu cầu và chưa có nhu cầu cụ thể.
- Giữ các bất biến đặt phòng: `StartTime < EndTime`; kiểm tra overlap với booking đang hiệu lực; tính cleanup buffer; kiểm tra trạng thái, quyền sở hữu khi hủy và quyền Admin/User.
- Khi thay đổi API hoặc nghiệp vụ dùng chung, kiểm tra cả backend và frontend consumer liên quan để tránh lệch contract.

## Kiểm chứng và báo cáo

- Chạy kiểm chứng nhỏ nhất nhưng đủ cho phần đã thay đổi:
  - Backend: `dotnet build src/BookingApi/BookingApi.csproj`
  - Frontend lint: `npm --prefix src/booking-client run lint`
  - Frontend build: `npm --prefix src/booking-client run build`
- Repository hiện chưa có test project tự động. Không tuyên bố “đã test đầy đủ”; nói rõ build/lint nào đã chạy và phần nào vẫn cần kiểm thử thủ công.
- Nếu lệnh không chạy được, báo lệnh, lỗi chính và phần chưa được xác minh. Không che giấu hoặc mô tả suy đoán như kết quả đã kiểm chứng.
- Khi kết thúc, tóm tắt ngắn: nội dung đã làm hoặc đã hướng dẫn, cách kiểm tra, giới hạn còn lại và bài học chính nếu đây là phiên học tập.
