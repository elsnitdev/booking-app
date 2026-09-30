using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models.Entities;
using BookingApi.Models.DTOs;
using BookingApi.Models.Responses;
using Microsoft.AspNetCore.Authorization;

namespace BookingApi.Controllers
{
  [Authorize(Roles = "Admin")] // yêu cầu người dùng phải đăng nhập để truy cập 
  [Route("api/[controller]")]
  [ApiController]
  public class AdminController : ControllerBase
  {
    private readonly AppDbContext _context;
    public AdminController(AppDbContext context)
    {
      _context = context;
    }
    // ================= 1. THỐNG KÊ & KPI TỔNG QUAN =================
    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
      // revenue from completed meetings
      var totalRevenue = await _context.Bookings
      .Where(b => b.Status == "Confirmed" || b.Status == "Completed")
      .SumAsync(b => b.TotalPrice);
      var totalBookings = await _context.Bookings.CountAsync();
      var confirmedBookings = await _context.Bookings.CountAsync(b => b.Status == "Confirmed");
      var pendingBookings = await _context.Bookings.CountAsync(b => b.Status == "Pending");
      var completedBookings = await _context.Bookings.CountAsync(b => b.Status == "Completed");
      var cancelledBookings = await _context.Bookings.CountAsync(b => b.Status == "Cancelled");
      var totalRooms = await _context.Rooms.CountAsync();
      var activeRooms = await _context.Rooms.CountAsync(r => r.IsActive);
      var totalCorporateUsers = await _context.Users.CountAsync(u => u.Role == "User");

      var recentBookings = await _context.Bookings
                   .Include(b => b.User)
                   .Include(b => b.Room)
                   .OrderByDescending(b => b.CreatedAt)
                   .Take(5)
                   .Select(b => new
                   {
                     b.Id,
                     b.Title,
                     CompanyName = b.User != null ? b.User.CompanyName : "Doanh nghiệp",
                     ContactEmail = b.User != null ? b.User.Email : "",
                     RoomName = b.Room != null ? b.Room.Name : "",
                     RoomType = b.Room != null ? b.Room.RoomType : "",
                     Date = b.StartTime.ToString("dd/MM/yyyy"),
                     StartTime = b.StartTime.ToString("HH:mm"),
                     EndTime = b.EndTime.ToString("HH:mm"),
                     b.ParticipantCount,
                     b.TotalPrice,
                     b.Status
                   })
                   .ToListAsync();
      return Ok(ApiResponse<object>.SuccessResult(new
      {
        TotalRevenue = totalRevenue,
        TotalBookings = totalBookings,
        ConfirmedBookings = confirmedBookings,
        PendingBookings = pendingBookings,
        CompletedBookings = completedBookings,
        CancelledBookings = cancelledBookings,
        TotalRooms = totalRooms,
        ActiveRooms = activeRooms,
        TotalCorporateUsers = totalCorporateUsers,
        RecentBookings = recentBookings
      }, "Lấy dữ liệu thống kê thành công."));


    }
    // ================= 2. QUẢN LÝ TẤT CẢ LỊCH ĐẶT =================
    [HttpGet("bookings")]
    public async Task<IActionResult> GetAllBookings([FromQuery] string? status, [FromQuery] string? search)
    {
      var query = _context.Bookings
      .Include(b => b.User)
      .Include(b => b.Room)
      .AsQueryable();
      // loc theo trang thai
      if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
      {
        query = query.Where(b => b.Status.ToLower() == status.ToLower());
      }
      // tim kiem theo ten cuoc hop 
      if (!string.IsNullOrWhiteSpace(search))
      {
        var keyword = search.Trim().ToLower();
        query = query.Where(b =>
            b.Title.ToLower().Contains(keyword) ||
            (b.User != null && b.User.CompanyName.ToLower().Contains(keyword)) ||
            (b.Room != null && b.Room.Name.ToLower().Contains(keyword)));
      }
      var bookings = await query
      .OrderByDescending(b => b.CreatedAt)
      .Select(b => new
      {
        Id = "BK-" + b.Id.ToString().Substring(0, 6).ToUpper(),
        RawId = b.Id,
        b.Title,
        CompanyName = b.User != null ? b.User.CompanyName : "Doanh nghiệp",
        ContactEmail = b.User != null ? b.User.Email : "",
        RoomName = b.Room != null ? b.Room.Name : "Phòng họp",
        RoomType = b.Room != null ? b.Room.RoomType : "Hội thảo",
        Date = b.StartTime.ToString("dd/MM/yyyy"),
        StartTime = b.StartTime.ToString("HH:mm"),
        EndTime = b.EndTime.ToString("HH:mm"),
        b.ParticipantCount,
        b.TotalPrice,
        b.Status,
        b.CreatedAt
      }).ToListAsync();
      return Ok(ApiResponse<object>.SuccessResult(bookings, "Lấy danh sách lịch đặt thành công."));
    }
    // Cập nhật trạng thái lịch họp (Xác nhận / Hoàn tất / Hủy)
    [HttpPut("bookings/{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] BookingStatusDto dto)
    {
      var booking = await _context.Bookings.FindAsync(id);
      if (booking == null)
      {
        return NotFound(ApiResponse<string>.ErrorResult("Không tìm thấy cuộc họp."));
      }
      booking.Status = dto.Status;
      await _context.SaveChangesAsync();
      return Ok(ApiResponse<string>.SuccessResult(booking.Id.ToString(), $"Đã cập nhật trạng thái sang '{dto.Status}'."));

    }
    // ================= 3. QUẢN LÝ DANH MỤC PHÒNG HỌP =================
    [HttpGet("rooms")]
    public async Task<IActionResult> GetAllRooms()
    {
      var rooms = await _context.Rooms
        .Include(r => r.Images)
        .Include(r => r.RoomAmenities)
          .ThenInclude(ra => ra.Amenity)
        .OrderByDescending(r => r.IsActive)
        .ThenBy(r => r.Name)
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

      return Ok(ApiResponse<List<RoomResponseDto>>.SuccessResult(rooms, "Lấy danh mục phòng thành công."));
    }

    [HttpPost("rooms")]
    public async Task<IActionResult> CreateRoom([FromBody] RoomManageDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ApiResponse<object>.ErrorResult("Dữ liệu nhập không hợp lệ."));
      }

      var room = new Room
      {
        Id = Guid.NewGuid(),
        Name = dto.Name,
        Capacity = dto.Capacity,
        RoomType = dto.RoomType,
        HourlyRate = dto.HourlyRate,
        Location = dto.Location,
        Description = dto.Description,
        CoverImageUrl = dto.CoverImageUrl,
        HasProjector = dto.HasProjector,
        HasWhiteboard = dto.HasWhiteboard,
        HasVideoConference = dto.HasVideoConference,
        CleanupTimeMinutes = dto.CleanupTimeMinutes,
        IsActive = dto.IsActive
      };

      // Xử lý danh sách hình ảnh
      if (dto.Images != null && dto.Images.Count > 0)
      {
        for (int i = 0; i < dto.Images.Count; i++)
        {
          var img = dto.Images[i];
          room.Images.Add(new RoomImage
          {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            ImageUrl = img.ImageUrl,
            Caption = img.Caption,
            Tag = img.Tag ?? "Overview",
            IsPrimary = img.IsPrimary || (i == 0 && string.IsNullOrEmpty(room.CoverImageUrl)),
            DisplayOrder = img.DisplayOrder > 0 ? img.DisplayOrder : i,
            CreatedAt = DateTime.UtcNow
          });
        }

        if (string.IsNullOrEmpty(room.CoverImageUrl))
        {
          room.CoverImageUrl = dto.Images[0].ImageUrl;
        }
      }

      // Xử lý danh sách tiện ích phòng
      if (dto.Amenities != null && dto.Amenities.Count > 0)
      {
        foreach (var a in dto.Amenities)
        {
          room.RoomAmenities.Add(new RoomAmenity
          {
            RoomId = room.Id,
            AmenityId = a.AmenityId,
            CustomNote = a.CustomNote,
            Quantity = a.Quantity > 0 ? a.Quantity : 1
          });
        }
      }

      _context.Rooms.Add(room);
      await _context.SaveChangesAsync();
      return Ok(ApiResponse<object>.SuccessResult(room, "Tạo phòng họp mới thành công!"));
    }

    [HttpPut("rooms/{id}")]
    public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] RoomManageDto dto)
    {
      var room = await _context.Rooms
        .Include(r => r.Images)
        .Include(r => r.RoomAmenities)
        .FirstOrDefaultAsync(r => r.Id == id);

      if (room == null)
      {
        return NotFound(ApiResponse<string>.ErrorResult("Không tìm thấy phòng họp cần sửa."));
      }

      room.Name = dto.Name;
      room.Capacity = dto.Capacity;
      room.RoomType = dto.RoomType;
      room.HourlyRate = dto.HourlyRate;
      room.Location = dto.Location;
      room.Description = dto.Description;
      room.CoverImageUrl = dto.CoverImageUrl;
      room.HasProjector = dto.HasProjector;
      room.HasWhiteboard = dto.HasWhiteboard;
      room.HasVideoConference = dto.HasVideoConference;
      room.CleanupTimeMinutes = dto.CleanupTimeMinutes;
      room.IsActive = dto.IsActive;

      // Cập nhật Images nếu có truyền lên
      if (dto.Images != null)
      {
        _context.RoomImages.RemoveRange(room.Images);
        for (int i = 0; i < dto.Images.Count; i++)
        {
          var img = dto.Images[i];
          _context.RoomImages.Add(new RoomImage
          {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            ImageUrl = img.ImageUrl,
            Caption = img.Caption,
            Tag = img.Tag ?? "Overview",
            IsPrimary = img.IsPrimary || (i == 0 && string.IsNullOrEmpty(room.CoverImageUrl)),
            DisplayOrder = img.DisplayOrder > 0 ? img.DisplayOrder : i,
            CreatedAt = DateTime.UtcNow
          });
        }

        if (string.IsNullOrEmpty(room.CoverImageUrl) && dto.Images.Count > 0)
        {
          room.CoverImageUrl = dto.Images[0].ImageUrl;
        }
      }

      // Cập nhật Amenities nếu có truyền lên
      if (dto.Amenities != null)
      {
        _context.RoomAmenities.RemoveRange(room.RoomAmenities);
        foreach (var a in dto.Amenities)
        {
          _context.RoomAmenities.Add(new RoomAmenity
          {
            RoomId = room.Id,
            AmenityId = a.AmenityId,
            CustomNote = a.CustomNote,
            Quantity = a.Quantity > 0 ? a.Quantity : 1
          });
        }
      }

      await _context.SaveChangesAsync();
      return Ok(ApiResponse<object>.SuccessResult(room, "Cập nhật phòng thành công"));
    }

    [HttpPut("rooms/{id}/toggle-status")]
    public async Task<IActionResult> ToggleRoomStatus(Guid id)
    {
      var room = await _context.Rooms.FindAsync(id);
      if (room == null)
      {
        return NotFound(ApiResponse<string>.ErrorResult("Không tìm thấy phòng họp cần sửa."));
      }
      room.IsActive = !room.IsActive;
      await _context.SaveChangesAsync();
      var statusStr = room.IsActive ? "Khả dụng" : "Tạm ngưng phục vụ";
      return Ok(ApiResponse<bool>.SuccessResult(room.IsActive, $"Đã chuyển phòng sang trạng thái: {statusStr}."));
    }

    // Lấy toàn bộ danh mục tiện nghi dùng chung
    [HttpGet("amenities")]
    public async Task<IActionResult> GetAllAmenities()
    {
      var amenities = await _context.Amenities
        .Where(a => a.IsActive)
        .OrderBy(a => a.Category)
        .ThenBy(a => a.Name)
        .ToListAsync();
      return Ok(ApiResponse<List<Amenity>>.SuccessResult(amenities, "Lấy danh mục tiện ích thành công."));
    }
    // ================= 4. QUẢN LÝ DOANH NGHIỆP THÀNH VIÊN =================
    [HttpGet("users")]
    public async Task<IActionResult> GetCorporateUsers()
    {
      var users = await _context.Users
      .Where(u => u.Role == "User")
      .Select(u => new
      {
        u.Id,
        u.Username,
        u.Email,
        u.CompanyName,
        u.Department,
        u.Role,
        TotalMeetings = u.Bookings.Count(),
        TotalSpent = u.Bookings
                         .Where(b => b.Status == "Confirmed" || b.Status == "Completed")
                         .Sum(b => b.TotalPrice)
      }).OrderByDescending(u => u.TotalSpent)
        .ToListAsync();
      return Ok(ApiResponse<object>.SuccessResult(users, "Lấy danh sách doanh nghiệp thành viên thành công."));
    }
  }
}