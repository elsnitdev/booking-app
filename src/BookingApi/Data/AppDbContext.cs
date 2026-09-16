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
                // Cấu hình RowVersion cho Optimistic Concurrency (chống nhiều người đặt cùng lúc)
                entity.Property(e => e.RowVersion).IsRowVersion();
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
