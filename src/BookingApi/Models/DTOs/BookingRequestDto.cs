using System;

namespace BookingApi.Models.DTOs
{
    public class BookingRequestDto
    {
        public Guid RoomId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int ParticipantCount { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}