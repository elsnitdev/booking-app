using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models.DTOs;
using BookingApi.Models.Responses;
using BookingApi.Models.Entities;
using System.Linq;

namespace BookingApi.Services
{
  public class BookingService : IBookingService
  {
    private readonly AppDbContext _context;

    public BookingService(AppDbContext context)
    {
      _context = context;
    }

    public async Task<ApiResponse<bool>> CheckAvailabilityAsync(BookingRequestDto request)
    {
      if (request.StartTime >= request.EndTime)
      {
        return ApiResponse<bool>.ErrorResult("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
      }

      var room = await _context.Rooms.FindAsync(request.RoomId);
      if (room == null || !room.IsActive)
      {
        return ApiResponse<bool>.ErrorResult("Phòng không tồn tại hoặc đang ngưng hoạt động.");
      }

      int buffer = room.CleanupTimeMinutes;

      bool isOverlap = await _context.Bookings
          .Where(b => b.RoomId == request.RoomId && b.Status == "Confirmed")
          .AnyAsync(b =>
              request.StartTime < b.EndTime.AddMinutes(buffer) &&
              request.EndTime.AddMinutes(buffer) > b.StartTime);

      if (isOverlap)
      {
        return ApiResponse<bool>.ErrorResult("Rất tiếc, khoảng thời gian này đã có người đặt hoặc vướng lịch dọn dẹp.");
      }

      return ApiResponse<bool>.SuccessResult(true, "Phòng trống, bạn có thể đặt!");
    }

    public async Task<ApiResponse<string>> CreateBookingAsync(BookingRequestDto request, Guid userId)
    {
      // 1. Dùng lại hàm check để kiểm tra một lần nữa trước khi lưu
      var checkResult = await CheckAvailabilityAsync(request);
      if (!checkResult.Success)
      {
        return ApiResponse<string>.ErrorResult(checkResult.Message);
      }
      var room = await _context.Rooms.FindAsync(request.RoomId);
      // 2. Tạo Entity mới
      var booking = new Booking
      {
        RoomId = request.RoomId,
        UserId = userId,
        StartTime = request.StartTime,
        EndTime = request.EndTime,
        Status = "Confirmed",
        CreatedAt = DateTime.UtcNow
      };
      if (room != null)
      {
        _context.Entry(room).State = EntityState.Modified; // change state to modified
      }
      // 3. Lưu xuống Database
      _context.Bookings.Add(booking);
      await _context.SaveChangesAsync();

      return ApiResponse<string>.SuccessResult(booking.Id.ToString(), "Đặt phòng thành công!");
    }
  }
}