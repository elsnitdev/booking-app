using BookingApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookingApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Amenity> Amenities { get; set; }
        public DbSet<RoomAmenity> RoomAmenities { get; set; }
        public DbSet<RoomImage> RoomImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình bảng User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Username).IsUnique(); // Tránh trùng Username
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
            });

            // Cấu hình bảng Room
            modelBuilder.Entity<Room>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.HourlyRate).HasPrecision(18, 2);
                entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
                entity.Property(e => e.Description).HasMaxLength(1000);
                // Cấu hình RowVersion cho Optimistic Concurrency (chống nhiều người đặt cùng lúc)
                entity.Property(e => e.RowVersion).IsRowVersion();
            });

            // Cấu hình bảng Amenity
            modelBuilder.Entity<Amenity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Icon).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(255);
            });

            // Cấu hình bảng quan hệ RoomAmenity (N-N giữa Room và Amenity)
            modelBuilder.Entity<RoomAmenity>(entity =>
            {
                entity.HasKey(ra => new { ra.RoomId, ra.AmenityId });
                entity.Property(ra => ra.CustomNote).HasMaxLength(250);

                entity.HasOne(ra => ra.Room)
                      .WithMany(r => r.RoomAmenities)
                      .HasForeignKey(ra => ra.RoomId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ra => ra.Amenity)
                      .WithMany(a => a.RoomAmenities)
                      .HasForeignKey(ra => ra.AmenityId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình bảng RoomImage (1-N với Room)
            modelBuilder.Entity<RoomImage>(entity =>
            {
                entity.HasKey(ri => ri.Id);
                entity.Property(ri => ri.ImageUrl).IsRequired().HasMaxLength(500);
                entity.Property(ri => ri.Caption).HasMaxLength(150);
                entity.Property(ri => ri.Tag).HasMaxLength(50);

                entity.HasOne(ri => ri.Room)
                      .WithMany(r => r.Images)
                      .HasForeignKey(ri => ri.RoomId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình bảng Booking
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                
                // Mối quan hệ Booking - User (1 User có nhiều Bookings)
                entity.HasOne(b => b.User)
                      .WithMany(u => u.Bookings)
                      .HasForeignKey(b => b.UserId)
                      .OnDelete(DeleteBehavior.Cascade); // Xóa User -> Xóa luôn Booking của họ

                // Mối quan hệ Booking - Room (1 Room có nhiều Bookings)
                entity.HasOne(b => b.Room)
                      .WithMany(r => r.Bookings)
                      .HasForeignKey(b => b.RoomId)
                      .OnDelete(DeleteBehavior.Restrict); // KHÔNG cho phép xóa Room nếu đang có Booking dính tới nó
            });
        }
    }
}
