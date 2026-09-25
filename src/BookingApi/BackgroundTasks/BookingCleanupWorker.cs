using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;

namespace BookingApi.Services
{
  public class BookingLifecycleWorker : BackgroundService
  {
    private readonly IServiceScopeFactory _scopeFactory;
    public readonly ILogger<BookingLifecycleWorker> _logger;

    public BookingLifecycleWorker(
              IServiceScopeFactory scopeFactory,
              ILogger<BookingLifecycleWorker> logger)
    {
      _scopeFactory = scopeFactory;
      _logger = logger;
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
      _logger.LogInformation("RUN => [BookingLifecycleWorker] Tiến trình nền quản lý vòng đời cuộc họp đã khởi động.");
      // Lặp vô hạn cho tới khi ứng dụng nhận tín hiệu dừng (Graceful Shutdown)
      while (!stoppingToken.IsCancellationRequested)
      {
        try
        {
          // 1. Tạo một Scope con để lấy AppDbContext (Scoped service)
          using (var scope = _scopeFactory.CreateAsyncScope())
          {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var now = DateTime.UtcNow;
            // 2. Lấy các cuộc họp đang Confirmed và đã qua EndTime
            // Kèm theo thông tin Room để biết thời gian dọn dẹp (CleanupTimeMinutes)
            var potentialBookings = await context.Bookings
            .Include(b => b.Room)
            .Where(b => b.Status == "Confirmed" && b.EndTime <= now)
            .ToListAsync();
            // 3. Lọc chính xác các ca họp đã qua cả thời gian dọn dẹp kỹ thuật
            var expiredBookings = potentialBookings
            .Where(b => now >= b.EndTime.AddMinutes(b.Room?.CleanupTimeMinutes ?? 0))
            .ToList();
            // 4. Nếu có ca họp hết hạn, cập nhật trạng thái sang "Completed"
            if (expiredBookings.Count > 0)
            {
              foreach (var booking in expiredBookings)
              {
                booking.Status = "Completed";
              }
              await context.SaveChangesAsync(stoppingToken);
              _logger.LogInformation(
                                "✅ [BookingLifecycleWorker] Đã hoàn tất và giải phóng {Count} ca họp vào lúc {Time} (UTC).",
                                expiredBookings.Count,
                                now.ToString("yyyy-MM-dd HH:mm:ss")
                            );
            }
          }
        }
        catch (Exception ex)
        {
          // Bọc try-catch bên trong vòng lặp để nếu có lỗi kết nối DB tạm thời, 
          // tiến trình nền vẫn sống sót và tiếp tục chạy ở chu kỳ tiếp theo
          _logger.LogError(ex, "❌ [BookingLifecycleWorker] Lỗi trong chu kỳ quét ca họp.");
        }  // 5. Tạm nghỉ định kỳ (Ví dụ: 1 đến 2 phút) trước khi bắt đầu chu kỳ quét kế tiếp
           // stoppingToken cho phép hủy chờ ngay lập tức khi API tắt máy
        await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
      }
      _logger.LogInformation("🛑 [BookingLifecycleWorker] Tiến trình nền đã dừng lại an toàn.");

    }

  }
}