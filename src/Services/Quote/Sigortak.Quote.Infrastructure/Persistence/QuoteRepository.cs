using Microsoft.EntityFrameworkCore;
using Sigortak.Quote.Domain.Interfaces;

namespace Sigortak.Quote.Infrastructure.Persistence;

public class QuoteRepository : IQuoteRepository
{
    private readonly QuoteDbContext _context;

    public QuoteRepository(QuoteDbContext context)
    {
        _context = context;
    }

    public async Task<Sigortak.Quote.Domain.Entities.Quote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Quotes.FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
    }

    public async Task<List<Sigortak.Quote.Domain.Entities.Quote>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Quotes.OrderByDescending(q => q.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<List<Sigortak.Quote.Domain.Entities.Quote>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await _context.Quotes
            .Where(q => q.VehicleId == vehicleId)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Sigortak.Quote.Domain.Entities.Quote> CreateAsync(Sigortak.Quote.Domain.Entities.Quote quote, CancellationToken cancellationToken = default)
    {
        await _context.Quotes.AddAsync(quote, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return quote;
    }

    public async Task UpdateAsync(Sigortak.Quote.Domain.Entities.Quote quote, CancellationToken cancellationToken = default)
    {
        _context.Quotes.Update(quote);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
