using Sigortak.WorkOrder.Domain.Entities;

namespace Sigortak.WorkOrder.Domain.Interfaces;

public interface IWorkOrderRepository
{
    Task<Entities.WorkOrder?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Entities.WorkOrder?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<List<Entities.WorkOrder>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<Entities.WorkOrder>> GetByAssignedUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Entities.WorkOrder> CreateAsync(Entities.WorkOrder workOrder, CancellationToken cancellationToken = default);
    Task UpdateAsync(Entities.WorkOrder workOrder, CancellationToken cancellationToken = default);
}
