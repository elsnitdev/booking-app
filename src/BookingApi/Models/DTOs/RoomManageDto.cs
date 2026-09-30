using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BookingApi.Models.DTOs
{
    public class RoomAmenityInputDto
    {
        public Guid AmenityId { get; set; }
        public string? CustomNote { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class RoomManageDto
    {
        [Required(ErrorMessage = "Tên phòng không được để trống")]
        public string Name { get; set; } = string.Empty;

        [Range(2, 200, ErrorMessage = "Sức chứa tối thiểu 2 người")]
        public int Capacity { get; set; }

        public string RoomType { get; set; } = "Executive Boardroom";

        [Range(0, 100000000, ErrorMessage = "Giá thuê không hợp lệ")]
        public decimal HourlyRate { get; set; }

        public string Location { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? CoverImageUrl { get; set; }

        public bool HasProjector { get; set; } = true;

        public bool HasWhiteboard { get; set; } = true;

        public bool HasVideoConference { get; set; } = false;

        public int CleanupTimeMinutes { get; set; } = 15;

        public bool IsActive { get; set; } = true;

        public List<RoomImageDto>? Images { get; set; }

        public List<RoomAmenityInputDto>? Amenities { get; set; }
    }
}
