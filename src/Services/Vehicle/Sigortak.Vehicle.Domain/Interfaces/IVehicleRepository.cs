using Sigortak.Vehicle.Domain.Entities;

namespace Sigortak.Vehicle.Domain.Interfaces;

/// <summary>
/// Araç veri erişim belirteci.
/// </summary>
public interface IVehicleRepository
{
    Task<Entities.Vehicle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Entities.Vehicle?> GetByPlateAsync(string plate, CancellationToken cancellationToken = default);
    Task<List<Entities.Vehicle>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Entities.Vehicle> CreateAsync(Entities.Vehicle vehicle, CancellationToken cancellationToken = default);
    Task UpdateAsync(Entities.Vehicle vehicle, CancellationToken cancellationToken = default);
    Task<bool> ExistsByPlateAsync(string plate, CancellationToken cancellationToken = default);
}
