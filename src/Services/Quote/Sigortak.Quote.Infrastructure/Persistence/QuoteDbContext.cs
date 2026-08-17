using Microsoft.EntityFrameworkCore;
using Sigortak.Quote.Domain.Entities;

namespace Sigortak.Quote.Infrastructure.Persistence;

public class QuoteDbContext : DbContext
{
    private readonly Sigortak.Common.ITenantProvider _tenantProvider;

    public QuoteDbContext(DbContextOptions<QuoteDbContext> options, Sigortak.Common.ITenantProvider tenantProvider) : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    public Guid CurrentTenantId => _tenantProvider.TenantId ?? Guid.Empty;

    public DbSet<Sigortak.Quote.Domain.Entities.Quote> Quotes => Set<Sigortak.Quote.Domain.Entities.Quote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Sigortak.Quote.Domain.Entities.Quote>(entity =>
        {
            entity.ToTable("quotes");
            entity.HasKey(e => e.Id);

            entity.HasQueryFilter(e => e.TenantId == CurrentTenantId);

            entity.Property(e => e.TenantId).IsRequired();
            entity.Property(e => e.VehiclePlate).HasMaxLength(20).IsRequired();
            entity.Property(e => e.VehicleInfo).HasMaxLength(150);
            entity.Property(e => e.InsuranceCompany).HasMaxLength(100).IsRequired();
            entity.Property(e => e.AgentName).HasMaxLength(100);
            entity.Property(e => e.PolicyType).IsRequired();
            entity.Property(e => e.Premium).HasPrecision(18, 2).IsRequired();
            entity.Property(e => e.ValidityDate).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.ImmLimit).HasMaxLength(100);
            entity.Property(e => e.ReplacementCarDuration).HasMaxLength(100);
            entity.Property(e => e.ExemptStatus).HasMaxLength(100);
            entity.Property(e => e.PdfDocumentUrl).HasMaxLength(500);

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
