using Microsoft.EntityFrameworkCore;
using Sigortak.Vehicle.Domain.Entities;

namespace Sigortak.Vehicle.Infrastructure.Persistence;

/// <summary>
/// Araç ve Poliçe ilişkisel görünümü için Read DB Context (PostgreSQL Read DB).
/// </summary>
public class ReadDbContext : DbContext
{
    private readonly Sigortak.Common.ITenantProvider _tenantProvider;

    public ReadDbContext(DbContextOptions<ReadDbContext> options, Sigortak.Common.ITenantProvider tenantProvider)
        : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    public Guid CurrentTenantId => _tenantProvider.TenantId ?? Guid.Empty;

    public DbSet<VehiclePolicyView> VehiclePolicies => Set<VehiclePolicyView>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<VehiclePolicyView>(entity =>
        {
            entity.ToTable("vehicle_policies");
            entity.HasKey(e => e.VehicleId);

            // Tenant global query filter
            entity.HasQueryFilter(e => e.TenantId == CurrentTenantId);

            entity.Property(e => e.TenantId).IsRequired();
            entity.Property(e => e.Plate).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Brand).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Model).HasMaxLength(100).IsRequired();
            entity.Property(e => e.BodyType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.PolicyNumber).HasMaxLength(100);
            entity.Property(e => e.SbmPolicyNumber).HasMaxLength(100);
            entity.Property(e => e.DocumentUrl).HasMaxLength(500);
            entity.Property(e => e.Premium).HasPrecision(18, 2);
            entity.Property(e => e.OwnerTcNo).HasMaxLength(20);
            entity.Property(e => e.OwnerAddress).HasMaxLength(500);
            entity.Property(e => e.UsageType).HasMaxLength(100);
            entity.Property(e => e.TrafficRegistrationDate);
        });
    }
}
