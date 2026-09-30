using System.Text;
using BookingApi.Data;
using BookingApi.Models.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHostedService<BookingApi.Services.BookingLifecycleWorker>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
// Cấu hình CORS để cho phép Frontend React gọi API
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowAll", policy =>
  {
    policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000") // Port của Vite React
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // BẮT BUỘC để cho phép nhận/gửi Cookie
  });
});

// Cấu hình Swagger
builder.Services.AddSwaggerGen();

// Cấu hình Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký Services
builder.Services.AddScoped<BookingApi.Services.IBookingService, BookingApi.Services.BookingService>();

// Cấu hình JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
  options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
  options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
  options.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = jwtSettings["Issuer"],
    ValidAudience = jwtSettings["Audience"],
    IssuerSigningKey = new SymmetricSecurityKey(key)
  };
  options.Events = new JwtBearerEvents
  {
    OnMessageReceived = context =>
    {
      if (context.Request.Cookies.ContainsKey("auth_token"))
      {
        context.Token = context.Request.Cookies["auth_token"];
      }
      return Task.CompletedTask;
    }
  };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll"); // Cho phép CORS trước Authentication

app.UseAuthentication(); // BẮT BUỘC ĐỨNG TRƯỚC UseAuthorization
app.UseAuthorization();

app.MapControllers();

// Nạp dữ liệu mẫu ban đầu cho Amenities và RoomImages
await BookingApi.Data.DbSeeder.SeedAmenitiesAndImagesAsync(app.Services);

app.Run();
