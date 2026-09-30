using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BookingApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BookingApi.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAmenitiesAndImagesAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // 1. Seed Master Amenities
            if (!await context.Amenities.AnyAsync())
            {
                var amenities = new List<Amenity>
                {
                    new Amenity
                    {
                        Id = Guid.NewGuid(),
                        Name = "Màn hình LED hội trường lớn",
                        Category = "Nghe nhìn & Trình chiếu",
                        Icon = "monitor",
                        Description = "Màn hình LED P2 siêu nét kích thước lớn phục vụ hội thảo, sự kiện quy mô",
                        IsActive = true
                    },
                    new Amenity
                    {
                        Id = Guid.NewGuid(),
                        Name = "Smart TV 4K & Bàn ghế hội đàm",
                        Category = "Nội thất & Không gian",
                        Icon = "tv",
                        Description = "TV 75-85 inch Ultra HD kèm bàn họp gỗ tự nhiên và ghế da công thái học",
                        IsActive = true
                    },
                    new Amenity
                    {
                        Id = Guid.NewGuid(),
                        Name = "Không gian sàn trống đa năng",
                        Category = "Nội thất & Không gian",
                        Icon = "maximize-2",
                        Description = "Sàn gỗ thông thoáng không vướng cột, phù hợp workshop chuyển động, diễn tập, yoga, team building",
                        IsActive = true
                    },
                    new Amenity
                    {
                        Id = Guid.NewGuid(),
                        Name = "Hệ thống âm thanh & Micro đa hướng",
                        Category = "Nghe nhìn & Trình chiếu",
                        Icon = "mic",
                        Description = "Loa kiểm âm hội trường, micro không dây UHF chống hú và lọc ồn",
                        IsActive = true
                    },
                    new Amenity
                    {
                        Id = Guid.NewGuid(),
                        Name = "Hội nghị truyền hình trực tuyến (Zoom / Teams)",
                        Category = "Công nghệ",
                        Icon = "video",
                        Description = "Camera PTZ 4K AI tự động bắt người nói, micro trần thu âm 360 độ",
                        IsActive = true
                    },
                    new Amenity
                    {
                        Id = Guid.NewGuid(),
                        Name = "Bảng kính từ tính & Bút dạ thảo luận",
                        Category = "Nội thất & Không gian",
                        Icon = "presentation",
                        Description = "Bảng kính cường lực khổ rộng kèm bộ bút dạ chuyên dụng cho brainstorming",
                        IsActive = true
                    },
                    new Amenity
                    {
                        Id = Guid.NewGuid(),
                        Name = "Wifi 6 doanh nghiệp 1Gbps",
                        Category = "Công nghệ",
                        Icon = "wifi",
                        Description = "Băng thông độc lập, hỗ trợ kết nối đồng thời hơn 100 thiết bị",
                        IsActive = true
                    },
                    new Amenity
                    {
                        Id = Guid.NewGuid(),
                        Name = "Quầy cà phê pha hạt & Trà thảo mộc",
                        Category = "Tiện ích ẩm thực",
                        Icon = "coffee",
                        Description = "Máy pha Espresso tự động, trà organic thượng hạng phục vụ tại phòng",
                        IsActive = true
                    }
                };

                await context.Amenities.AddRangeAsync(amenities);
                await context.SaveChangesAsync();
            }

            // 2. Seed Images and RoomAmenities for existing rooms
            var rooms = await context.Rooms.ToListAsync();
            var allAmenities = await context.Amenities.ToListAsync();

            var sampleImages = new[]
            {
                new { Url = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop", Caption = "Góc toàn cảnh không gian hội thảo", Tag = "Overview" },
                new { Url = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop", Caption = "Bàn hội đàm chính diện và ghế công thái học", Tag = "Boardroom" },
                new { Url = "https://images.unsplash.com/photo-1572025442646-866d16c84a54?q=80&w=1200&auto=format&fit=crop", Caption = "Khu vực màn hình trình chiếu và sân khấu", Tag = "Stage" },
                new { Url = "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop", Caption = "Góc thảo luận nhóm và bảng ý tưởng", Tag = "Workshop" },
                new { Url = "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?q=80&w=1200&auto=format&fit=crop", Caption = "Quầy teabreak và sảnh nghỉ ngơi", Tag = "Lounge" }
            };

            foreach (var room in rooms)
            {
                // Cập nhật CoverImageUrl và Description nếu còn trống
                if (string.IsNullOrEmpty(room.CoverImageUrl))
                {
                    room.CoverImageUrl = sampleImages[0].Url;
                }
                if (string.IsNullOrEmpty(room.Description))
                {
                    room.Description = $"{room.Name} - Không gian hội thảo và họp chiến lược cao cấp, tích hợp đầy đủ công nghệ âm thanh, hình ảnh và tiện nghi phục vụ doanh nghiệp.";
                }

                // Seed RoomImages nếu phòng này chưa có ảnh trong bảng RoomImages
                var hasImages = await context.RoomImages.AnyAsync(ri => ri.RoomId == room.Id);
                if (!hasImages)
                {
                    for (int i = 0; i < sampleImages.Length; i++)
                    {
                        var imgInfo = sampleImages[i];
                        context.RoomImages.Add(new RoomImage
                        {
                            Id = Guid.NewGuid(),
                            RoomId = room.Id,
                            ImageUrl = imgInfo.Url,
                            Caption = $"{room.Name} - {imgInfo.Caption}",
                            Tag = imgInfo.Tag,
                            IsPrimary = (i == 0),
                            DisplayOrder = i,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }

                // Seed RoomAmenities nếu phòng chưa được gán tiện nghi
                var hasRoomAmenities = await context.RoomAmenities.AnyAsync(ra => ra.RoomId == room.Id);
                if (!hasRoomAmenities && allAmenities.Count > 0)
                {
                    // Tùy theo loại phòng gán các tiện nghi phù hợp
                    var isGrandHall = room.Capacity >= 30 || room.Name.ToLower().Contains("hội trường") || room.RoomType.ToLower().Contains("summit");
                    var isWorkshop = room.RoomType.ToLower().Contains("workshop") || room.Name.ToLower().Contains("sáng tạo") || room.Name.ToLower().Contains("creative");

                    foreach (var amenity in allAmenities)
                    {
                        string? customNote = null;
                        bool shouldAdd = false;

                        if (amenity.Name.Contains("Màn hình LED") && isGrandHall)
                        {
                            shouldAdd = true;
                            customNote = "Màn hình LED P2.0 kích thước 300 inch siêu nét";
                        }
                        else if (amenity.Name.Contains("Smart TV") && !isGrandHall)
                        {
                            shouldAdd = true;
                            customNote = "Smart TV Samsung 85 inch QLED 4K";
                        }
                        else if (amenity.Name.Contains("sàn trống") && isWorkshop)
                        {
                            shouldAdd = true;
                            customNote = "Sàn gỗ tiêu chuẩn 100m² không vướng cột, có thảm tập và đệm ngồi";
                        }
                        else if (amenity.Name.Contains("Wifi") || amenity.Name.Contains("âm thanh") || amenity.Name.Contains("Zoom") || amenity.Name.Contains("Bảng kính") || amenity.Name.Contains("cà phê"))
                        {
                            shouldAdd = true;
                            if (amenity.Name.Contains("Wifi")) customNote = "Băng thông cáp quang 1Gbps riêng biệt";
                            if (amenity.Name.Contains("Zoom")) customNote = "Hệ thống Logitech Rally Plus 4K đa điểm";
                        }

                        if (shouldAdd)
                        {
                            context.RoomAmenities.Add(new RoomAmenity
                            {
                                RoomId = room.Id,
                                AmenityId = amenity.Id,
                                CustomNote = customNote,
                                Quantity = 1
                            });
                        }
                    }
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
