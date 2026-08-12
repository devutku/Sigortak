using Microsoft.EntityFrameworkCore;
using Sigortak.Vehicle.Domain.Interfaces;
using Sigortak.Vehicle.Domain.Entities;

namespace Sigortak.Vehicle.Infrastructure.Persistence;

/// <summary>
/// Araç veri erişim implementasyonu.
/// </summary>
public class VehicleRepository : IVehicleRepository
{
    private readonly VehicleDbContext _context;

    public VehicleRepository(VehicleDbContext context)
    {
        _context = context;
    }

    public async Task<Domain.Entities.Vehicle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<Domain.Entities.Vehicle?> GetByPlateAsync(string plate, CancellationToken cancellationToken = default)
    {
        return await _context.Vehicles.FirstOrDefaultAsync(v => v.Plate.ToLower() == plate.ToLower(), cancellationToken);
    }

    public async Task<List<Domain.Entities.Vehicle>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Vehicles.OrderByDescending(v => v.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<Domain.Entities.Vehicle> CreateAsync(Domain.Entities.Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        await _context.Vehicles.AddAsync(vehicle, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return vehicle;
    }

    public async Task UpdateAsync(Domain.Entities.Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        _context.Vehicles.Update(vehicle);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsByPlateAsync(string plate, CancellationToken cancellationToken = default)
    {
        return await _context.Vehicles.AnyAsync(v => v.Plate.ToLower() == plate.ToLower(), cancellationToken);
    }
}
