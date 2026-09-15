using System.Threading.Tasks;
using BookingApi.Models.DTOs;
using BookingApi.Models.Responses;

namespace BookingApi.Services
{
    public interface IBookingService
    {
        Task<ApiResponse<bool>> CheckAvailabilityAsync(BookingRequestDto request);
        Task<ApiResponse<string>> CreateBookingAsync(BookingRequestDto request, System.Guid userId);
    }
}