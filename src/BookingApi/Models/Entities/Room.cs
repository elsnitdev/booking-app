using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BookingApi.Models.Entities
{
    public class Room
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Thông tin phòng họp
        public string RoomType { get; set; } = "Meeting Room"; // Meeting Room, Workshop, Boardroom
        public decimal HourlyRate { get; set; } = 0;
        public string Location { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        
        // Tiện ích
        public bool HasProjector { get; set; } = true;
        public bool HasWhiteboard { get; set; } = true;
        public bool HasVideoConference { get; set; } = false;

        // Thời gian dọn dẹp phòng (phút), admin có thể đổi
        public int CleanupTimeMinutes { get; set; } = 15;

        // Concurrency token for Optimistic Locking (chống đụng độ)
        [Timestamp]
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        // Navigation property
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<RoomImage> Images { get; set; } = new List<RoomImage>();
        public ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
    }
}
