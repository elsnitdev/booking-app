# Quy trình cộng tác với AI

Tài liệu này mở rộng `AGENTS.md` cho các nhiệm vụ cần hướng dẫn nhiều bước, sửa bug, thêm tính năng, thay đổi API/database hoặc review code. `AGENTS.md` luôn là nguồn quy tắc chính; nếu hai file mâu thuẫn, làm theo `AGENTS.md`.

## 1. Quy trình học tập mặc định

Khi người dùng chưa yêu cầu AI trực tiếp triển khai, làm việc theo vòng lặp sau:

1. **Làm rõ mục tiêu:** diễn đạt ngắn gọn kết quả cần đạt và hành vi mong đợi.
2. **Tìm đúng ngữ cảnh:** đọc các file trực tiếp liên quan; không yêu cầu người dùng cung cấp thông tin có thể tìm thấy trong repository.
3. **Giải thích thiết kế:** mô tả luồng dữ liệu, trách nhiệm của từng lớp và lý do chọn cách làm bằng ngôn ngữ phù hợp với người học.
4. **Đưa một bước thực hành:** nêu file/vị trí cần sửa, mục đích và tiêu chí tự kiểm tra. Không đưa toàn bộ lời giải nếu người dùng muốn tự code.
5. **Review kết quả:** kiểm tra correctness, convention, lỗi biên và giải thích cụ thể điều cần sửa.
6. **Kiểm chứng:** hướng dẫn hoặc chạy lệnh phù hợp với quyền mà người dùng đã trao.
7. **Chốt kiến thức:** tóm tắt điều vừa học, vì sao giải pháp hoạt động và bước tiếp theo hợp lý.

Nếu người dùng yêu cầu triển khai rõ ràng, AI có thể tự thực hiện toàn bộ các bước kỹ thuật trong phạm vi; vẫn phải giải thích quyết định quan trọng và báo kết quả kiểm chứng.

## 2. Quy trình theo loại nhiệm vụ

### Sửa bug

1. Xác định cách tái hiện, expected behavior và actual behavior.
2. Lần theo request/data flow từ điểm lỗi đến nguyên nhân; không sửa triệu chứng khi chưa hiểu nguyên nhân gốc.
3. Đưa giả thuyết dựa trên bằng chứng trong code hoặc log.
4. Chọn thay đổi nhỏ nhất giải quyết nguyên nhân mà không làm đổi contract ngoài ý muốn.
5. Kiểm tra case tái hiện, case thành công và ít nhất một case biên liên quan.

### Thêm tính năng

1. Chốt tiêu chí chấp nhận và xác định phần backend, frontend, database bị ảnh hưởng.
2. Kiểm tra pattern hiện có trước khi tạo abstraction hoặc dependency mới.
3. Thiết kế contract và validation trước; sau đó triển khai theo luồng DTO → Controller → Service → DbContext và request client → types → UI khi phù hợp.
4. Kiểm tra authentication, authorization, lỗi nghiệp vụ và tương thích với chức năng hiện có.
5. Chạy build/lint liên quan và mô tả các luồng cần kiểm thử thủ công.

### Thay đổi API

1. Xác định endpoint, method, request/response DTO, HTTP status và yêu cầu authorization hiện tại.
2. Nêu rõ thay đổi có phá vỡ tương thích hay không; không tự ý đổi route hoặc shape response công khai.
3. Cập nhật đồng bộ backend DTO/controller/service và frontend request/type/consumer bị ảnh hưởng.
4. Kiểm tra response lỗi không làm lộ chi tiết nội bộ hoặc dữ liệu nhạy cảm.

### Thay đổi database

1. Đọc Entity, `AppDbContext`, migration gần nhất và consumer của dữ liệu liên quan.
2. Giải thích thay đổi schema, dữ liệu cũ, nullability/default, quan hệ và rủi ro mất dữ liệu.
3. Không sửa migration hoặc model snapshot bằng tay. Chỉ tạo/chạy migration bằng EF Core khi người dùng yêu cầu rõ.
4. Không tự chạy thao tác cập nhật database production hoặc thao tác phá hủy dữ liệu.
5. Sau thay đổi, kiểm tra build và nêu cách xác minh migration trên môi trường phát triển an toàn.

## 3. Checklist review

Chỉ áp dụng các mục liên quan đến thay đổi:

- **Correctness:** logic có đáp ứng tiêu chí chấp nhận và xử lý input không hợp lệ không?
- **Booking invariants:** `StartTime < EndTime`, overlap, cleanup buffer, trạng thái và concurrency có còn đúng không?
- **Authentication:** endpoint cần đăng nhập có được bảo vệ và nhận diện đúng user không?
- **Authorization:** User/Admin có bị vượt quyền, đọc hoặc sửa dữ liệu không thuộc quyền sở hữu không?
- **API compatibility:** route, DTO, status code và `ApiResponse` có đồng bộ với frontend không?
- **Error handling:** lỗi có status/message phù hợp, không nuốt lỗi và không lộ secret hoặc chi tiết nội bộ không?
- **Data access:** truy vấn EF Core có giới hạn đúng dữ liệu, tránh tải thừa và giữ quan hệ/xóa dữ liệu đúng ý không?
- **Frontend:** loading, empty, error và success state có được xử lý; type và request có khớp response không?
- **Scope:** diff có chứa refactor, file sinh tự động hoặc thay đổi không liên quan không?

## 4. Định nghĩa hoàn thành

Một nhiệm vụ chỉ được coi là hoàn thành khi:

- Hành vi yêu cầu đã được triển khai hoặc người học đã hoàn thành bước được hướng dẫn.
- Không còn thay đổi ngoài phạm vi hoặc file sinh tự động do AI cố ý chỉnh sửa.
- Backend/frontend contract liên quan đã được đối chiếu.
- Build/lint phù hợp đã chạy thành công, hoặc giới hạn khiến chúng chưa chạy được đã được báo rõ.
- Các kiểm thử thủ công còn cần thiết được liệt kê cụ thể.
- Người dùng nhận được giải thích ngắn về quyết định chính và bài học có thể áp dụng lại.

Repository hiện chưa có test project tự động. `dotnet build` và frontend lint/build là kiểm tra nền, không thay thế unit test, integration test hay kiểm thử luồng thực tế.

## 5. Mẫu báo cáo cuối

Sử dụng cấu trúc ngắn và chỉ giữ phần có liên quan:

```text
Kết quả: Đã làm hoặc đã hướng dẫn những gì.
Kiểm chứng: Các lệnh/luồng đã kiểm tra và kết quả.
Chưa kiểm chứng: Phần chưa thể chạy hoặc cần kiểm thử thủ công.
Bài học chính: Vì sao cách làm này phù hợp với dự án.
```
