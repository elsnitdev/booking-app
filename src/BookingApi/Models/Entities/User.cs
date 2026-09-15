using System;
using System.Collections.Generic;

namespace BookingApi.Models.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User"; // Admin, User
        public string Email { get; set; } = string.Empty;
        
        // Thông tin công ty / tổ chức
        public string CompanyName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        
        // Navigation property
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
