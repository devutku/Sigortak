using MediatR;
using Sigortak.Common.Models;
using Sigortak.Quote.Domain.Interfaces;

namespace Sigortak.Quote.Application.Queries.GetQuotes;

public record GetQuotesQuery : IRequest<Result<List<Sigortak.Quote.Domain.Entities.Quote>>>;

public class GetQuotesQueryHandler : IRequestHandler<GetQuotesQuery, Result<List<Sigortak.Quote.Domain.Entities.Quote>>>
{
    private readonly IQuoteRepository _quoteRepository;

    public GetQuotesQueryHandler(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<Result<List<Sigortak.Quote.Domain.Entities.Quote>>> Handle(GetQuotesQuery request, CancellationToken cancellationToken)
    {
        var quotes = await _quoteRepository.GetAllAsync(cancellationToken);
        return Result.Success(quotes);
    }
}
