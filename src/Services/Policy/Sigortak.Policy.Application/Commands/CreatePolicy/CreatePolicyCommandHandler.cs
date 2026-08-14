using MediatR;
using Sigortak.Common.Models;
using Sigortak.EventBus.Kafka;
using Sigortak.Policy.Application.Events;
using Sigortak.Policy.Application.Interfaces;
using Sigortak.Policy.Domain.Entities;
using Sigortak.Policy.Domain.Interfaces;

namespace Sigortak.Policy.Application.Commands.CreatePolicy;

public class CreatePolicyCommandHandler : IRequestHandler<CreatePolicyCommand, Result<Guid>>
{
    private readonly IPolicyRepository _policyRepository;
    private readonly IPolicyStorageService _storageService;
    private readonly KafkaEventBus _eventBus;

    public CreatePolicyCommandHandler(
        IPolicyRepository policyRepository,
        IPolicyStorageService storageService,
        KafkaEventBus eventBus)
    {
        _policyRepository = policyRepository;
        _storageService = storageService;
        _eventBus = eventBus;
    }

    public async Task<Result<Guid>> Handle(CreatePolicyCommand request, CancellationToken cancellationToken)
    {
        string documentUrl = string.Empty;
        if (request.FileStream != null && request.FileStream != Stream.Null && !string.IsNullOrEmpty(request.FileName))
        {
            var uniqueFileName = $"{Guid.NewGuid()}_{request.FileName}";
            documentUrl = await _storageService.UploadPolicyDocumentAsync(
                request.FileStream,
                uniqueFileName,
                request.ContentType,
                cancellationToken);
        }

        var policy = new Domain.Entities.Policy
        {
            Id = Guid.NewGuid(),
            PolicyNumber = request.PolicyNumber,
            SbmPolicyNumber = request.SbmPolicyNumber,
            VehicleId = request.VehicleId,
            StartDate = request.StartDate.ToUniversalTime(),
            EndDate = request.EndDate.ToUniversalTime(),
            Premium = request.Premium,
            DocumentUrl = documentUrl,
            IsActive = true,
            PolicyType = request.PolicyType
        };

        await _policyRepository.CreateAsync(policy, cancellationToken);

        // Kafka Event Yayınla
        var policyCreatedEvent = new PolicyCreatedEvent(
            policy.Id,
            policy.PolicyNumber,
            policy.SbmPolicyNumber,
            policy.VehicleId,
            policy.StartDate,
            policy.EndDate,
            policy.Premium,
            policy.DocumentUrl,
            (int)policy.PolicyType
        );

        await _eventBus.PublishAsync(policyCreatedEvent, cancellationToken);

        return Result.Success(policy.Id, "Poliçe başarıyla oluşturuldu.");
    }
}
