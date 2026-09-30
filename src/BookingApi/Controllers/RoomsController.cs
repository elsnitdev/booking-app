using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models.DTOs;
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
      var rooms = await _context.Rooms
        .Include(r => r.Images)
        .Include(r => r.RoomAmenities)
          .ThenInclude(ra => ra.Amenity)
        .Where(r => r.IsActive)
        .OrderBy(r => r.Name)
        .Select(r => new RoomResponseDto
        {
          Id = r.Id,
          Name = r.Name,
          Capacity = r.Capacity,
          IsActive = r.IsActive,
          RoomType = r.RoomType,
          HourlyRate = r.HourlyRate,
          Location = r.Location,
          Description = r.Description,
          CoverImageUrl = r.CoverImageUrl,
          HasProjector = r.HasProjector,
          HasWhiteboard = r.HasWhiteboard,
          HasVideoConference = r.HasVideoConference,
          CleanupTimeMinutes = r.CleanupTimeMinutes,
          Images = r.Images.OrderBy(i => i.DisplayOrder).Select(i => new RoomImageDto
          {
            Id = i.Id,
            ImageUrl = i.ImageUrl,
            Caption = i.Caption,
            Tag = i.Tag,
            IsPrimary = i.IsPrimary,
            DisplayOrder = i.DisplayOrder
          }).ToList(),
          Amenities = r.RoomAmenities.Where(ra => ra.Amenity != null && ra.Amenity.IsActive).Select(ra => new AmenityDto
          {
            Id = ra.Amenity!.Id,
            Name = ra.Amenity.Name,
            Category = ra.Amenity.Category,
            Icon = ra.Amenity.Icon,
            Description = ra.Amenity.Description,
            CustomNote = ra.CustomNote,
            Quantity = ra.Quantity
          }).ToList()
        })
        .ToListAsync();

      return Ok(ApiResponse<List<RoomResponseDto>>.SuccessResult(rooms, "Lấy danh sách phòng thành công."));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoomById(Guid id)
    {
      var r = await _context.Rooms
        .Include(r => r.Images)
        .Include(r => r.RoomAmenities)
          .ThenInclude(ra => ra.Amenity)
        .FirstOrDefaultAsync(r => r.Id == id);

      if (r == null) return NotFound(ApiResponse<object>.ErrorResult("Không tìm thấy phòng."));

      var dto = new RoomResponseDto
      {
        Id = r.Id,
        Name = r.Name,
        Capacity = r.Capacity,
        IsActive = r.IsActive,
        RoomType = r.RoomType,
        HourlyRate = r.HourlyRate,
        Location = r.Location,
        Description = r.Description,
        CoverImageUrl = r.CoverImageUrl,
        HasProjector = r.HasProjector,
        HasWhiteboard = r.HasWhiteboard,
        HasVideoConference = r.HasVideoConference,
        CleanupTimeMinutes = r.CleanupTimeMinutes,
        Images = r.Images.OrderBy(i => i.DisplayOrder).Select(i => new RoomImageDto
        {
          Id = i.Id,
          ImageUrl = i.ImageUrl,
          Caption = i.Caption,
          Tag = i.Tag,
          IsPrimary = i.IsPrimary,
          DisplayOrder = i.DisplayOrder
        }).ToList(),
        Amenities = r.RoomAmenities.Where(ra => ra.Amenity != null && ra.Amenity.IsActive).Select(ra => new AmenityDto
        {
          Id = ra.Amenity!.Id,
          Name = ra.Amenity.Name,
          Category = ra.Amenity.Category,
          Icon = ra.Amenity.Icon,
          Description = ra.Amenity.Description,
          CustomNote = ra.CustomNote,
          Quantity = ra.Quantity
        }).ToList()
      };

      return Ok(ApiResponse<RoomResponseDto>.SuccessResult(dto, "Thành công."));
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
    [HttpGet("{id}/occupied-slots")]
    public async Task<IActionResult> GetOccupiedSlot(Guid id, [FromQuery] DateOnly date)
    {
      // kiem tra phong co ton tai khong
      var room = await _context.Rooms.FindAsync(id);
      if (room == null)
      {
        return NotFound(ApiResponse<object>.ErrorResult("Không tìm thấy phòng họp."));
      }
      // xac dinh tgian dau ngay va cuoi ngay duoc chon 
      var startOfDay = date.ToDateTime(TimeOnly.MinValue);
      var endOfDay = date.ToDateTime(TimeOnly.MaxValue);
      // lay ra cac cuoc hop da confirmed in day 
      var bookings = await _context.Bookings
      .Where(b => b.RoomId == id &&
      b.Status == "Confirmed" &&
      b.StartTime < endOfDay &&
      b.EndTime > startOfDay)
      .OrderBy(b => b.StartTime)
      .Select(b => new
      {
        b.Id,
        b.Title,
        b.StartTime,
        b.EndTime,
        // Giờ kết thúc thực tế sau khi đã cộng thêm thời gian dọn dẹp của phòng
        BlockedUntil = b.EndTime.AddMinutes(room.CleanupTimeMinutes)
      }).ToListAsync();

      return Ok(ApiResponse<object>.SuccessResult(new
      {
        Date = date.ToString("yyyy-MM-dd"),
        CleanupTimeMinutes = room.CleanupTimeMinutes,
        OccupiedSlots = bookings
      }, "Lấy danh sách khung giờ bận thành công."));
    }
  }
}
