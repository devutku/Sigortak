using Sigortak.Vehicle.Domain.Entities;

namespace Sigortak.Vehicle.Domain.Interfaces;

public interface IPolicyRepository
{
    Task<Policy?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Policy?> GetActivePolicyByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<List<Policy>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<Policy> CreateAsync(Policy policy, CancellationToken cancellationToken = default);
    Task UpdateAsync(Policy policy, CancellationToken cancellationToken = default);
}
