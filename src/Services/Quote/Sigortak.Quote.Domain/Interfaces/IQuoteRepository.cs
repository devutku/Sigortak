namespace Sigortak.Quote.Domain.Interfaces;

public interface IQuoteRepository
{
    Task<Sigortak.Quote.Domain.Entities.Quote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Sigortak.Quote.Domain.Entities.Quote>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<Sigortak.Quote.Domain.Entities.Quote>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<Sigortak.Quote.Domain.Entities.Quote> CreateAsync(Sigortak.Quote.Domain.Entities.Quote quote, CancellationToken cancellationToken = default);
    Task UpdateAsync(Sigortak.Quote.Domain.Entities.Quote quote, CancellationToken cancellationToken = default);
}
