using Microsoft.EntityFrameworkCore;
using Sigortak.WorkOrder.Domain.Entities;

namespace Sigortak.WorkOrder.Infrastructure.Persistence;

public class WorkOrderDbContext : DbContext
{
    public WorkOrderDbContext(DbContextOptions<WorkOrderDbContext> options) : base(options)
    {
    }

    public DbSet<Domain.Entities.WorkOrder> WorkOrders => Set<Domain.Entities.WorkOrder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Domain.Entities.WorkOrder>(entity =>
        {
            entity.ToTable("work_orders");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.OrderNumber)
                .HasMaxLength(50)
                .IsRequired();
            entity.HasIndex(e => e.OrderNumber).IsUnique();

            entity.Property(e => e.Title).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.OrderType).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.Priority).IsRequired();
            entity.Property(e => e.SpecialNotes).HasMaxLength(2000);

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
