using System;

namespace BookingApi.Models.Entities
{
    public class RoomImage
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RoomId { get; set; }
        public Room? Room { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
        public string? Caption { get; set; } // "Góc toàn cảnh bàn hội đàm"
        public string? Tag { get; set; } // "Overview", "Stage", "Seating", "Lounge", "Tech"
        public bool IsPrimary { get; set; } = false;
        public int DisplayOrder { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
