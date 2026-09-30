using System;
using System.Collections.Generic;

namespace BookingApi.Models.Entities
{
    public class Amenity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = "General"; // Nghe nhìn & Trình chiếu, Nội thất & Không gian, Công nghệ, Tiện ích ẩm thực
        public string Icon { get; set; } = "sparkles"; // Lucide icon name: monitor, tv, maximize-2, mic, video, presentation, wifi, coffee
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation property
        public ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
    }
}
