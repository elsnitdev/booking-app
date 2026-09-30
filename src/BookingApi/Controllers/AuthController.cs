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
using BookingApi.Models.Entities;
using BookingApi.Models.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
namespace BookingApi.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class AuthController : ControllerBase
  {
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<User> _passwordHasher;
    public AuthController(AppDbContext context, IConfiguration configuration, IPasswordHasher<User> passwordHasher)
    {
      _context = context;
      _configuration = configuration;
      _passwordHasher = passwordHasher;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
      var account = string.IsNullOrEmpty(request.Username) ? request.Email : request.Username;
      var user = await _context.Users.FirstOrDefaultAsync(u =>
          u.Username == account || u.Email == account);

      if (user == null)
      {
        return Unauthorized(ApiResponse<string>.ErrorResult("Sai tài khoản hoặc mật khẩu."));
      }
      try
      {
        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
          return Unauthorized(ApiResponse<string>.ErrorResult("Sai tài khoản hoặc mật khẩu."));
        }
      }
      catch (FormatException)
      {
        // Xử lý tài khoản cũ chưa được hash: kiểm tra tạm nếu khớp plain-text
        if (user.PasswordHash != request.Password)
        {
          return Unauthorized(ApiResponse<string>.ErrorResult("Sai tài khoản hoặc mật khẩu."));
        }
        // Tự động nâng cấp (re-hash) tài khoản cũ lên chuẩn bảo mật mới
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        await _context.SaveChangesAsync();
      }
      // 3. Tạo JWT Token
      var token = GenerateJwtToken(user);
      // 4. Ghi Cookie HttpOnly an toàn
      var cookieOptions = new CookieOptions
      {
        HttpOnly = true,
        Secure = Request.IsHttps,
        SameSite = SameSiteMode.Lax,
        Expires = DateTime.UtcNow.AddHours(2),
        Path = "/"
      }; Response.Cookies.Append("auth_token", token, cookieOptions);
      return Ok(ApiResponse<string>.SuccessResult(token, "Đăng nhập thành công"));
    }
    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
      // Xóa Cookie bằng cách ghi đè hạn hết hạn ngay lập tức
      Response.Cookies.Delete("auth_token", new CookieOptions
      {
        HttpOnly = true,
        Secure = Request.IsHttps,
        SameSite = SameSiteMode.Lax,
        Path = "/"
      });
      return Ok(ApiResponse<string>.SuccessResult(null, "Đăng xuất thành công"));
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] LoginDto request)
    {
      if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        return BadRequest(ApiResponse<string>.ErrorResult("Tài khoản đã tồn tại."));

      var user = new Models.Entities.User
      {
        Username = request.Username,
        Role = "User",
        Email = string.IsNullOrEmpty(request.Email) ? request.Username : request.Email,
        CompanyName = request.CompanyName,
        Department = request.Department,
      };
      user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
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
