using Microsoft.EntityFrameworkCore;

namespace Sigortak.Vehicle.Infrastructure.Persistence;

/// <summary>
/// Araç modülü PostgreSQL Write DB context'i.
/// </summary>
public class VehicleDbContext : DbContext
{
    private readonly Sigortak.Common.ITenantProvider _tenantProvider;

    public VehicleDbContext(DbContextOptions<VehicleDbContext> options, Sigortak.Common.ITenantProvider tenantProvider)
        : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    public Guid CurrentTenantId => _tenantProvider.TenantId ?? Guid.Empty;

    public DbSet<Domain.Entities.Vehicle> Vehicles => Set<Domain.Entities.Vehicle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Domain.Entities.Vehicle>(entity =>
        {
            entity.ToTable("vehicles");
            entity.HasKey(e => e.Id);

            // Tenant global query filter
            entity.HasQueryFilter(e => e.TenantId == CurrentTenantId);

            entity.Property(e => e.TenantId)
                .IsRequired();

            entity.Property(e => e.Plate)
                .HasMaxLength(20)
                .IsRequired();
            entity.HasIndex(e => e.Plate).IsUnique();

            entity.Property(e => e.Brand).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Model).HasMaxLength(100).IsRequired();
            entity.Property(e => e.EngineNumber).HasMaxLength(100);
            entity.Property(e => e.ChassisNumber).HasMaxLength(100);
            entity.Property(e => e.BodyType).IsRequired();
            entity.Property(e => e.InspectionDate);
            entity.Property(e => e.InsuranceEndDate);
            entity.Property(e => e.OwnerTcNo).HasMaxLength(20);
            entity.Property(e => e.OwnerAddress).HasMaxLength(500);
            entity.Property(e => e.UsageType).HasMaxLength(100);
            entity.Property(e => e.TrafficRegistrationDate);

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
                    if (entry.Entity is Common.Entities.IMultiTenant mt && mt.TenantId == Guid.Empty)
                    {
                        mt.TenantId = _tenantProvider.TenantId ?? Guid.Empty;
                    }
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
