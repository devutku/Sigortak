using Microsoft.EntityFrameworkCore;
using Sigortak.WorkOrder.Domain.Interfaces;
using Sigortak.WorkOrder.Domain.Entities;

namespace Sigortak.WorkOrder.Infrastructure.Persistence;

public class WorkOrderRepository : IWorkOrderRepository
{
    private readonly WorkOrderDbContext _context;

    public WorkOrderRepository(WorkOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Domain.Entities.WorkOrder?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.WorkOrders.FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public async Task<Domain.Entities.WorkOrder?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        return await _context.WorkOrders.FirstOrDefaultAsync(w => w.OrderNumber == orderNumber, cancellationToken);
    }

    public async Task<List<Domain.Entities.WorkOrder>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.WorkOrders.OrderByDescending(w => w.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<List<Domain.Entities.WorkOrder>> GetByAssignedUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.WorkOrders
            .Where(w => w.AssignedUserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Domain.Entities.WorkOrder> CreateAsync(Domain.Entities.WorkOrder workOrder, CancellationToken cancellationToken = default)
    {
        await _context.WorkOrders.AddAsync(workOrder, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return workOrder;
    }

    public async Task UpdateAsync(Domain.Entities.WorkOrder workOrder, CancellationToken cancellationToken = default)
    {
        _context.WorkOrders.Update(workOrder);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
