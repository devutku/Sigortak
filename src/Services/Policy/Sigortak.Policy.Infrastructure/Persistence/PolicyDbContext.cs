using Microsoft.EntityFrameworkCore;
using Sigortak.Policy.Domain.Entities;

namespace Sigortak.Policy.Infrastructure.Persistence;

public class PolicyDbContext : DbContext
{
    public PolicyDbContext(DbContextOptions<PolicyDbContext> options) : base(options)
    {
    }

    public DbSet<Domain.Entities.Policy> Policies => Set<Domain.Entities.Policy>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Domain.Entities.Policy>(entity =>
        {
            entity.ToTable("policies");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.PolicyNumber)
                .HasMaxLength(50)
                .IsRequired();
            entity.HasIndex(e => e.PolicyNumber).IsUnique();

            entity.Property(e => e.SbmPolicyNumber).HasMaxLength(100);
            entity.Property(e => e.VehicleId).IsRequired();
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate).IsRequired();
            entity.Property(e => e.Premium).HasPrecision(18, 2).IsRequired();
            entity.Property(e => e.DocumentUrl).HasMaxLength(500);
            entity.Property(e => e.PolicyType).IsRequired();

            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.CreatedBy).HasMaxLength(100);
            entity.Property(e => e.UpdatedBy).HasMaxLength(100);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
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
