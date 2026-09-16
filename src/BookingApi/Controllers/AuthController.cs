using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models.DTOs;
using BookingApi.Models.Responses;
using Microsoft.AspNetCore.Authorization;

namespace BookingApi.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class AuthController : ControllerBase
  {
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
      _context = context;
      _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
      var account = string.IsNullOrEmpty(request.Username) ? request.Email : request.Username;
      var user = await _context.Users.FirstOrDefaultAsync(u => 
        (u.Username == account || u.Email == account) && u.PasswordHash == request.Password);

      if (user == null)
      {
        return Unauthorized(ApiResponse<string>.ErrorResult("Sai tài khoản hoặc mật khẩu."));
      }

      var token = GenerateJwtToken(user);
      return Ok(ApiResponse<string>.SuccessResult(token, "Đăng nhập thành công"));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] LoginDto request)
    {
      if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        return BadRequest(ApiResponse<string>.ErrorResult("Tài khoản đã tồn tại."));

      var user = new Models.Entities.User
      {
        Username = request.Username,
        PasswordHash = request.Password,
        Role = "User",
        Email = string.IsNullOrEmpty(request.Email) ? request.Username : request.Email,
        CompanyName = request.CompanyName,
        Department = request.Department,
      };

      _context.Users.Add(user);
      await _context.SaveChangesAsync();
      return Ok(ApiResponse<string>.SuccessResult(user.Id.ToString(), "Đăng ký thành công!"));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
      var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

      var user = await _context.Users.FindAsync(userId);
      if (user == null) return NotFound(ApiResponse<object>.ErrorResult("Không tìm thấy thông tin người dùng."));

      return Ok(ApiResponse<object>.SuccessResult(new
      {
        user.Id,
        user.Username,
        user.Email,
        user.CompanyName,
        user.Department,
        user.Role
      }, "Lấy thông tin cá nhân thành công."));
    }

    private string GenerateJwtToken(Models.Entities.User user)
    {
      var jwtSettings = _configuration.GetSection("Jwt");
      var keyBytes = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

      var tokenHandler = new JwtSecurityTokenHandler();
      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(new[]
          {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
        Expires = DateTime.UtcNow.AddHours(2),
        Issuer = jwtSettings["Issuer"],
        Audience = jwtSettings["Audience"],
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
      };

      var token = tokenHandler.CreateToken(tokenDescriptor);
      return tokenHandler.WriteToken(token);
    }
  }
}
