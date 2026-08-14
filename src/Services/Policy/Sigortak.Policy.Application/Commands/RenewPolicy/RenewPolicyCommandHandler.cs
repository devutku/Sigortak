using MediatR;
using Sigortak.Common.Models;
using Sigortak.EventBus.Kafka;
using Sigortak.Policy.Application.Events;
using Sigortak.Policy.Application.Interfaces;
using Sigortak.Policy.Domain.Entities;
using Sigortak.Policy.Domain.Interfaces;

namespace Sigortak.Policy.Application.Commands.RenewPolicy;

public class RenewPolicyCommandHandler : IRequestHandler<RenewPolicyCommand, Result<Guid>>
{
    private readonly IPolicyRepository _policyRepository;
    private readonly IPolicyStorageService _storageService;
    private readonly KafkaEventBus _eventBus;

    public RenewPolicyCommandHandler(
        IPolicyRepository policyRepository,
        IPolicyStorageService storageService,
        KafkaEventBus eventBus)
    {
        _policyRepository = policyRepository;
        _storageService = storageService;
        _eventBus = eventBus;
    }

    public async Task<Result<Guid>> Handle(RenewPolicyCommand request, CancellationToken cancellationToken)
    {
        // Eski aktif poliçeleri pasife çek
        var activePolicies = await _policyRepository.GetByVehicleIdAsync(request.VehicleId, cancellationToken);
        foreach (var oldPolicy in activePolicies.Where(p => p.IsActive))
        {
            oldPolicy.IsActive = false;
            await _policyRepository.UpdateAsync(oldPolicy, cancellationToken);
        }

        // Yeni PDF yükle
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
        var policyRenewedEvent = new PolicyRenewedEvent(
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

        await _eventBus.PublishAsync(policyRenewedEvent, cancellationToken);

        return Result.Success(policy.Id, "Poliçe başarıyla yenilendi.");
    }
}
