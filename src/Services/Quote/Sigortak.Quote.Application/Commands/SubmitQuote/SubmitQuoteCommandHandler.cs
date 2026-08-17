using MediatR;
using Sigortak.Common.Models;
using Sigortak.EventBus.Kafka;
using Sigortak.Quote.Application.Events;
using Sigortak.Quote.Application.Interfaces;
using Sigortak.Quote.Domain.Entities;
using Sigortak.Quote.Domain.Enums;
using Sigortak.Quote.Domain.Interfaces;

namespace Sigortak.Quote.Application.Commands.SubmitQuote;

public class SubmitQuoteCommandHandler : IRequestHandler<SubmitQuoteCommand, Result<Guid>>
{
    private readonly IQuoteRepository _quoteRepository;
    private readonly IQuoteStorageService _storageService;
    private readonly KafkaEventBus _eventBus;

    public SubmitQuoteCommandHandler(
        IQuoteRepository quoteRepository,
        IQuoteStorageService storageService,
        KafkaEventBus eventBus)
    {
        _quoteRepository = quoteRepository;
        _storageService = storageService;
        _eventBus = eventBus;
    }

    public async Task<Result<Guid>> Handle(SubmitQuoteCommand request, CancellationToken cancellationToken)
    {
        string documentUrl = string.Empty;
        if (request.FileStream != null && request.FileStream != Stream.Null && !string.IsNullOrEmpty(request.FileName))
        {
            var uniqueFileName = $"{Guid.NewGuid()}_{request.FileName}";
            documentUrl = await _storageService.UploadQuoteDocumentAsync(
                request.FileStream,
                uniqueFileName,
                request.ContentType,
                cancellationToken);
        }

        var quote = new Sigortak.Quote.Domain.Entities.Quote
        {
            Id = Guid.NewGuid(),
            VehicleId = request.VehicleId,
            VehiclePlate = request.VehiclePlate.ToUpperInvariant(),
            VehicleInfo = request.VehicleInfo,
            InsuranceCompany = request.InsuranceCompany,
            AgentName = request.AgentName,
            PolicyType = request.PolicyType,
            Premium = request.Premium,
            ValidityDate = request.ValidityDate.ToUniversalTime(),
            Status = QuoteStatus.Pending,
            ImmLimit = request.ImmLimit,
            ReplacementCarDuration = request.ReplacementCarDuration,
            ExemptStatus = request.ExemptStatus,
            GlassCovered = request.GlassCovered,
            AsstServices = request.AsstServices,
            PdfDocumentUrl = documentUrl
        };

        await _quoteRepository.CreateAsync(quote, cancellationToken);

        // Publish event to Kafka
        var quoteReceivedEvent = new QuoteReceivedEvent(
            quote.Id,
            quote.VehicleId,
            quote.VehiclePlate,
            quote.VehicleInfo,
            quote.InsuranceCompany,
            quote.AgentName,
            (int)quote.PolicyType,
            quote.Premium,
            quote.ValidityDate,
            quote.ImmLimit,
            quote.ReplacementCarDuration,
            quote.ExemptStatus,
            quote.GlassCovered,
            quote.AsstServices,
            quote.PdfDocumentUrl
        );
        quoteReceivedEvent.TenantId = quote.TenantId;

        await _eventBus.PublishAsync(quoteReceivedEvent, cancellationToken);

        return Result.Success(quote.Id, "Teklif başarıyla kaydedildi.");
    }
}
