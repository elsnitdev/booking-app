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

            var result = await _bookingService.CreateBookingAsync(request, userId);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}
