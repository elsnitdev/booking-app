using System;

namespace BookingApi.Models.Entities
{
    public class Booking
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid UserId { get; set; }
        public User? User { get; set; }

        public Guid RoomId { get; set; }
        public Room? Room { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public int ParticipantCount { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        
        public decimal TotalPrice { get; set; }
        
        public string Status { get; set; } = "Confirmed"; // Confirmed, Cancelled
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
