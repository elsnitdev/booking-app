using System.ComponentModel.DataAnnotations;

namespace BookingApi.Models.DTOs
{
    public class BookingStatusDto
    {
        [Required(ErrorMessage = "Trạng thái không được để trống")]
        public string Status { get; set; } = "Confirmed"; // Confirmed, Pending, Completed, Cancelled
    }
}