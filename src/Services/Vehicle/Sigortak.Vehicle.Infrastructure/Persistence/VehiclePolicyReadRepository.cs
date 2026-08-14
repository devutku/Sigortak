using Microsoft.EntityFrameworkCore;
using Sigortak.Vehicle.Domain.Interfaces;
using Sigortak.Vehicle.Domain.Entities;

namespace Sigortak.Vehicle.Infrastructure.Persistence;

public class VehiclePolicyReadRepository : IVehiclePolicyReadRepository
{
    private readonly ReadDbContext _context;

    public VehiclePolicyReadRepository(ReadDbContext context)
    {
        _context = context;
    }

    public async Task<VehiclePolicyView?> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await _context.VehiclePolicies.IgnoreQueryFilters().FirstOrDefaultAsync(vp => vp.VehicleId == vehicleId, cancellationToken);
    }

    public async Task<VehiclePolicyView?> GetByPlateAsync(string plate, CancellationToken cancellationToken = default)
    {
        return await _context.VehiclePolicies.IgnoreQueryFilters().FirstOrDefaultAsync(vp => vp.Plate.ToLower() == plate.ToLower(), cancellationToken);
    }

    public async Task<List<VehiclePolicyView>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var allCount = await _context.VehiclePolicies.IgnoreQueryFilters().CountAsync(cancellationToken);
        var filteredCount = await _context.VehiclePolicies.CountAsync(cancellationToken);
        System.Console.WriteLine($"[DEBUG] VehiclePolicyReadRepository: allCount={allCount}, filteredCount={filteredCount}");
        
        return await _context.VehiclePolicies.OrderByDescending(vp => vp.UpdatedAt).ToListAsync(cancellationToken);
    }

    public async Task CreateAsync(VehiclePolicyView view, CancellationToken cancellationToken = default)
    {
        await _context.VehiclePolicies.AddAsync(view, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(VehiclePolicyView view, CancellationToken cancellationToken = default)
    {
        _context.VehiclePolicies.Update(view);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
