using Microsoft.EntityFrameworkCore;
using Sigortak.Policy.Domain.Entities;

namespace Sigortak.Policy.Infrastructure.Persistence;

public class PolicyDbContext : DbContext
{
    private readonly Sigortak.Common.ITenantProvider _tenantProvider;

    public PolicyDbContext(DbContextOptions<PolicyDbContext> options, Sigortak.Common.ITenantProvider tenantProvider) : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    public Guid CurrentTenantId => _tenantProvider.TenantId ?? Guid.Empty;

    public DbSet<Domain.Entities.Policy> Policies => Set<Domain.Entities.Policy>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Domain.Entities.Policy>(entity =>
        {
            entity.ToTable("policies");
            entity.HasKey(e => e.Id);

            // Tenant global query filter
            entity.HasQueryFilter(e => e.TenantId == CurrentTenantId);

            entity.Property(e => e.TenantId)
                .IsRequired();

            entity.Property(e => e.PolicyNumber)
                .HasMaxLength(50)
                .IsRequired();
            entity.HasIndex(e => e.PolicyNumber);

            entity.Property(e => e.SbmPolicyNumber).HasMaxLength(100);
            entity.Property(e => e.VehicleId).IsRequired();
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate).IsRequired();
            entity.Property(e => e.Premium).HasPrecision(18, 2).IsRequired();
            entity.Property(e => e.DocumentUrl).HasMaxLength(500);
            entity.Property(e => e.PolicyType).IsRequired();

            // Extended Configuration
            entity.Property(e => e.CompanyName).HasMaxLength(200);
            entity.Property(e => e.RenewalNumber).HasMaxLength(20);
            entity.Property(e => e.AgencyCode).HasMaxLength(50);
            entity.Property(e => e.NetPremium).HasPrecision(18, 2);
            entity.Property(e => e.Commission).HasPrecision(18, 2);
            entity.Property(e => e.VehicleValue).HasPrecision(18, 2);
            entity.Property(e => e.ImmLimit).HasMaxLength(100);
            entity.Property(e => e.PersonalAccidentCoverage).HasPrecision(18, 2);
            entity.Property(e => e.LegalProtection).HasPrecision(18, 2);
            entity.Property(e => e.TramerDocumentNo).HasMaxLength(100);

            entity.Property(e => e.Discounts)
                .HasConversion(
                    v => string.Join(",", v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            entity.Property(e => e.ExtraCoverages)
                .HasConversion(
                    v => string.Join(",", v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            // Payment Status
            entity.Property(e => e.IsPaid).HasDefaultValue(false);
            entity.Property(e => e.PaymentNote).HasMaxLength(500);

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
