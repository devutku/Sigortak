using Microsoft.EntityFrameworkCore;
using Sigortak.Identity.Domain.Entities;

namespace Sigortak.Identity.Infrastructure.Persistence;

/// <summary>
/// Identity veritabanı context'i — PostgreSQL Write DB.
/// </summary>
public class IdentityDbContext : DbContext
{
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsRequired();
            entity.HasIndex(e => e.Username).IsUnique();

            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();

            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);

            entity.Property(e => e.Role)
                .HasConversion<string>()
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.CreatedBy).HasMaxLength(100);
            entity.Property(e => e.UpdatedBy).HasMaxLength(100);

            entity.HasMany(e => e.RefreshTokens)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // RefreshToken configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Token)
                .HasMaxLength(500)
                .IsRequired();
            entity.HasIndex(e => e.Token).IsUnique();

            entity.Property(e => e.CreatedByIp).HasMaxLength(50);
            entity.Property(e => e.RevokedByIp).HasMaxLength(50);
            entity.Property(e => e.ReplacedByToken).HasMaxLength(500);
            entity.Property(e => e.ReasonRevoked).HasMaxLength(255);
        });

        // Seed data — varsayılan SystemAdmin
        var adminId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = adminId,
            Username = "admin",
            Email = "admin@sigortak.dev",
            // BCrypt hash of "Admin123!"
            PasswordHash = "$2a$11$K3rGPHdSOGPCqKj4i8HNMeADdTaFGJTXUQ5YqYvD.3tP7tRQ1K/Wy",
            FirstName = "Sistem",
            LastName = "Yöneticisi",
            Role = Domain.Enums.Role.SystemAdmin,
            IsActive = true,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            CreatedBy = "system"
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Audit alanlarını otomatik güncelle
        foreach (var entry in ChangeTracker.Entries<Common.Entities.AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
