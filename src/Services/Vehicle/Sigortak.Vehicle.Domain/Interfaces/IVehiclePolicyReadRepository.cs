using Sigortak.Vehicle.Domain.Entities;

namespace Sigortak.Vehicle.Domain.Interfaces;

public interface IVehiclePolicyReadRepository
{
    Task<VehiclePolicyView?> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<VehiclePolicyView?> GetByPlateAsync(string plate, CancellationToken cancellationToken = default);
    Task<List<VehiclePolicyView>> GetAllAsync(CancellationToken cancellationToken = default);
    Task CreateAsync(VehiclePolicyView view, CancellationToken cancellationToken = default);
    Task UpdateAsync(VehiclePolicyView view, CancellationToken cancellationToken = default);
}
