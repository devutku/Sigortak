using Microsoft.EntityFrameworkCore;
using Sigortak.Vehicle.Domain.Interfaces;
using Sigortak.Vehicle.Domain.Entities;

namespace Sigortak.Vehicle.Infrastructure.Persistence;

public class PolicyRepository : IPolicyRepository
{
    private readonly VehicleDbContext _context;

    public PolicyRepository(VehicleDbContext context)
    {
        _context = context;
    }

    public async Task<Policy?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Policies.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Policy?> GetActivePolicyByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.Policies
            .Where(p => p.VehicleId == vehicleId && p.IsActive && p.StartDate <= now && p.EndDate >= now)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<Policy>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await _context.Policies
            .Where(p => p.VehicleId == vehicleId)
            .OrderByDescending(p => p.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<Policy> CreateAsync(Policy policy, CancellationToken cancellationToken = default)
    {
        await _context.Policies.AddAsync(policy, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return policy;
    }

    public async Task UpdateAsync(Policy policy, CancellationToken cancellationToken = default)
    {
        _context.Policies.Update(policy);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
