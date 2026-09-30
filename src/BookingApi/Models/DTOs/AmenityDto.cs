using System;

namespace BookingApi.Models.DTOs
{
    public class AmenityDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CustomNote { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
