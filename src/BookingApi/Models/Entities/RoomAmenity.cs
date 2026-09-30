using System;

namespace BookingApi.Models.Entities
{
    public class RoomAmenity
    {
        public Guid RoomId { get; set; }
        public Room? Room { get; set; }

        public Guid AmenityId { get; set; }
        public Amenity? Amenity { get; set; }

        public string? CustomNote { get; set; } // Ghi chú riêng từng phòng, VD: "Màn hình LED 300 inch P2.5", "Sàn gỗ 100m² không cột"
        public int Quantity { get; set; } = 1;
    }
}
