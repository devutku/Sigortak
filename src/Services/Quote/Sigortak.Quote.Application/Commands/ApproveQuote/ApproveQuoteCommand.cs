using MediatR;
using Microsoft.Extensions.Configuration;
using Sigortak.Common.Exceptions;
using Sigortak.Common.Models;
using Sigortak.EventBus.Kafka;
using Sigortak.Quote.Application.Events;
using Sigortak.Quote.Domain.Interfaces;

namespace Sigortak.Quote.Application.Commands.ApproveQuote;

public record ApproveQuoteCommand(Guid QuoteId) : IRequest<Result<Guid>>;

public class ApproveQuoteCommandHandler : IRequestHandler<ApproveQuoteCommand, Result<Guid>>
{
    private readonly IQuoteRepository _quoteRepository;
    private readonly KafkaEventBus _eventBus;
    private readonly IConfiguration _configuration;

    public ApproveQuoteCommandHandler(
        IQuoteRepository quoteRepository, 
        KafkaEventBus eventBus,
        IConfiguration configuration)
    {
        _quoteRepository = quoteRepository;
        _eventBus = eventBus;
        _configuration = configuration;
    }

    public async Task<Result<Guid>> Handle(ApproveQuoteCommand request, CancellationToken cancellationToken)
    {
        var quote = await _quoteRepository.GetByIdAsync(request.QuoteId, cancellationToken);
        if (quote == null)
            throw new NotFoundException("Quote", request.QuoteId);

        if (quote.Status != Domain.Enums.QuoteStatus.Pending)
            return Result.Failure<Guid>("Bu teklif zaten işlenmiş.");

        quote.Status = Domain.Enums.QuoteStatus.Approved;
        await _quoteRepository.UpdateAsync(quote, cancellationToken);

        // Generate Policy from Quote parameters
        var random = new Random();
        var policyNo = $"POL{random.Next(10000000, 99999999)}";
        var sbmNo = $"SBM{random.Next(10000000, 99999999)}";

        // Call Policy microservice synchronously to create policy
        using var client = new HttpClient();
        var content = new MultipartFormDataContent();
        content.Add(new StringContent(policyNo), "policyNumber");
        content.Add(new StringContent(sbmNo), "sbmPolicyNumber");
        content.Add(new StringContent(quote.VehicleId.ToString()), "vehicleId");
        content.Add(new StringContent(DateTime.UtcNow.ToString("o")), "startDate");
        content.Add(new StringContent(DateTime.UtcNow.AddYears(1).ToString("o")), "endDate");
        content.Add(new StringContent(quote.Premium.ToString()), "premium");
        content.Add(new StringContent(((int)quote.PolicyType).ToString()), "policyType");
        content.Add(new StringContent(quote.PdfDocumentUrl), "documentUrl");

        var policyApiEndpoint = _configuration["PolicyService:Endpoint"] ?? "http://policy-api:5003";

        try
        {
            var response = await client.PostAsync($"{policyApiEndpoint}/api/v1/policies", content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = await response.Content.ReadAsStringAsync(cancellationToken);
                return Result.Failure<Guid>($"Teklif onaylandı ancak poliçe oluşturulamadı: {errorMsg}");
            }
        }
        catch (Exception ex)
        {
            return Result.Failure<Guid>($"Poliçe servisine bağlanılamadı ({policyApiEndpoint}): {ex.Message}");
        }

        // Publish QuoteApprovedEvent to Kafka
        var syncEvent = new QuoteApprovedEvent(
            quote.Id,
            quote.VehicleId,
            quote.VehiclePlate,
            quote.InsuranceCompany,
            (int)quote.PolicyType,
            quote.Premium,
            quote.PdfDocumentUrl
        );
        syncEvent.TenantId = quote.TenantId;

        await _eventBus.PublishAsync(syncEvent, cancellationToken);

        return Result.Success(quote.Id, "Teklif onaylandı ve poliçeleştirildi.");
    }
}
