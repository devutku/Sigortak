using Microsoft.EntityFrameworkCore;
using Sigortak.Policy.Domain.Interfaces;
using Sigortak.Policy.Domain.Entities;

namespace Sigortak.Policy.Infrastructure.Persistence;

public class PolicyRepository : IPolicyRepository
{
    private readonly PolicyDbContext _context;

    public PolicyRepository(PolicyDbContext context)
    {
        _context = context;
    }

    public async Task<Domain.Entities.Policy?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Policies.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Domain.Entities.Policy?> GetActivePolicyByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.Policies
            .Where(p => p.VehicleId == vehicleId && p.IsActive && p.StartDate <= now && p.EndDate >= now)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<Domain.Entities.Policy>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await _context.Policies
            .Where(p => p.VehicleId == vehicleId)
            .OrderByDescending(p => p.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Domain.Entities.Policy>> GetExpiringPoliciesAsync(DateTime cutoffDate, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.Policies
            .Where(p => p.IsActive && p.EndDate > now && p.EndDate <= cutoffDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<Domain.Entities.Policy> CreateAsync(Domain.Entities.Policy policy, CancellationToken cancellationToken = default)
    {
        await _context.Policies.AddAsync(policy, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return policy;
    }

    public async Task UpdateAsync(Domain.Entities.Policy policy, CancellationToken cancellationToken = default)
    {
        _context.Policies.Update(policy);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
