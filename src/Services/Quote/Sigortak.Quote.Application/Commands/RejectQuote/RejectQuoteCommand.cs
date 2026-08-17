using MediatR;
using Sigortak.Common.Exceptions;
using Sigortak.Common.Models;
using Sigortak.Quote.Domain.Interfaces;

namespace Sigortak.Quote.Application.Commands.RejectQuote;

public record RejectQuoteCommand(Guid QuoteId) : IRequest<Result<bool>>;

public class RejectQuoteCommandHandler : IRequestHandler<RejectQuoteCommand, Result<bool>>
{
    private readonly IQuoteRepository _quoteRepository;

    public RejectQuoteCommandHandler(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<Result<bool>> Handle(RejectQuoteCommand request, CancellationToken cancellationToken)
    {
        var quote = await _quoteRepository.GetByIdAsync(request.QuoteId, cancellationToken);
        if (quote == null)
            throw new NotFoundException("Quote", request.QuoteId);

        if (quote.Status != Domain.Enums.QuoteStatus.Pending)
            return Result.Failure<bool>("Bu teklif zaten işlenmiş.");

        quote.Status = Domain.Enums.QuoteStatus.Rejected;
        await _quoteRepository.UpdateAsync(quote, cancellationToken);

        return Result.Success(true, "Teklif başarıyla reddedildi.");
    }
}
