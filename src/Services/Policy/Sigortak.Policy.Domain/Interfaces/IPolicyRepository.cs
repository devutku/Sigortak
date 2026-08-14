using Sigortak.Policy.Domain.Entities;

namespace Sigortak.Policy.Domain.Interfaces;

public interface IPolicyRepository
{
    Task<Entities.Policy?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Entities.Policy?> GetActivePolicyByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<List<Entities.Policy>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<List<Entities.Policy>> GetExpiringPoliciesAsync(DateTime cutoffDate, CancellationToken cancellationToken = default);
    Task<Entities.Policy> CreateAsync(Entities.Policy policy, CancellationToken cancellationToken = default);
    Task UpdateAsync(Entities.Policy policy, CancellationToken cancellationToken = default);
}
