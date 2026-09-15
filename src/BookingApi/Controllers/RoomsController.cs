using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models.Responses;

namespace BookingApi.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class RoomsController : ControllerBase
  {
    private readonly AppDbContext _context;

    public RoomsController(AppDbContext context)
    {
      _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms()
    {
      var rooms = await _context.Rooms.ToListAsync();
      return Ok(ApiResponse<object>.SuccessResult(rooms, "Lấy danh sách phòng thành công."));
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoomById(Guid id)
    {
      var room = await _context.Rooms.FindAsync(id);
      if (room == null) return NotFound(ApiResponse<object>.ErrorResult("Không tìm thấy phòng."));
      return Ok(ApiResponse<object>.SuccessResult(room, "Thành công."));
    }
    // Mẹo nhỏ: Setup tạm 1 API để bạn tạo nhanh Phòng giả lập nhằm Test API đặt phòng
    [HttpPost("setup-test-room")]
    public async Task<IActionResult> SetupTestRoom()
    {
      var room = new Models.Entities.Room { Name = "Phòng họp VIP 1", Capacity = 20, CleanupTimeMinutes = 90 };
      _context.Rooms.Add(room);
      await _context.SaveChangesAsync();
      return Ok(ApiResponse<object>.SuccessResult(room, "Tạo phòng test thành công."));
    }
  }
}
