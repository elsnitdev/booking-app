using System;
using System.Collections.Generic;

namespace BookingApi.Models.DTOs
{
    public class RoomResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public bool IsActive { get; set; }
        public string RoomType { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
        public string Location { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool HasProjector { get; set; }
        public bool HasWhiteboard { get; set; }
        public bool HasVideoConference { get; set; }
        public int CleanupTimeMinutes { get; set; }

        public List<RoomImageDto> Images { get; set; } = new();
        public List<AmenityDto> Amenities { get; set; } = new();
    }
}
