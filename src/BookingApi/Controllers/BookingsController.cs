using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BookingApi.Services;
using BookingApi.Models.DTOs;
using BookingApi.Data;
using Microsoft.EntityFrameworkCore;
using BookingApi.Models.Responses;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BookingApi.Controllers
{
  [Authorize] // Chặn API, yêu cầu phải đăng nhập mới được gọi
  [Route("api/[controller]")]
  [ApiController]
  public class BookingsController : ControllerBase
  {
    private readonly IBookingService _bookingService;
    private readonly AppDbContext _context;

    public BookingsController(IBookingService bookingService, AppDbContext context)
    {
      _bookingService = bookingService;
      _context = context;
    }

    [AllowAnonymous] // Cho phép check phòng trống mà không cần đăng nhập
    [HttpPost("check-availability")]
    public async Task<IActionResult> CheckAvailability([FromBody] BookingRequestDto request)
    {
      var result = await _bookingService.CheckAvailabilityAsync(request);
      if (!result.Success) return BadRequest(result);
      return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] BookingRequestDto request)
    {
      // Lấy ID người dùng từ Token
      var userIdString = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
      {
        return Unauthorized(ApiResponse<string>.ErrorResult("Không xác định được danh tính người dùng."));
      }

      try
      {
        var result = await _bookingService.CreateBookingAsync(request, userId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
      }
      catch (DbUpdateConcurrencyException)
      {
        return StatusCode(StatusCodes.Status409Conflict, ApiResponse<string>.ErrorResult("Phòng họp vừa được một đơn vị khác hoàn tất đăng ký trước bạn vài giây. Vui lòng chọn khung giờ khác!"));
      }
    }
    [HttpGet("my-booking")]
    [HttpGet("my-bookings")]
    public async Task<IActionResult> GetMyBookings()
    {
      var userIdString =
      User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
      {
        return Unauthorized(ApiResponse<object>.ErrorResult("Chưa đăng nhập."));
      }
      var bookings = await _context.Bookings
      .Include(b => b.Room)
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
        Room = b.Room != null ? new
        {
          b.Room.Id,
          b.Room.Name,
          b.Room.Location,
          b.Room.RoomType
        } : null
      })
      .ToListAsync();
      return Ok(ApiResponse<object>.SuccessResult(bookings, "Lấy danh sách đặt phòng thành công."));
    }
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
  }

}
