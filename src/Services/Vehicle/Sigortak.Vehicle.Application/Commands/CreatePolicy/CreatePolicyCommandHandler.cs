using MediatR;
using Sigortak.Common.Models;
using Sigortak.EventBus.Kafka;
using Sigortak.Vehicle.Application.Events;
using Sigortak.Vehicle.Application.Interfaces;
using Sigortak.Vehicle.Domain.Entities;
using Sigortak.Vehicle.Domain.Interfaces;

namespace Sigortak.Vehicle.Application.Commands.CreatePolicy;

public class CreatePolicyCommandHandler : IRequestHandler<CreatePolicyCommand, Result<Guid>>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IPolicyRepository _policyRepository;
    private readonly IPolicyStorageService _storageService;
    private readonly KafkaEventBus _eventBus;

    public CreatePolicyCommandHandler(
        IVehicleRepository vehicleRepository,
        IPolicyRepository policyRepository,
        IPolicyStorageService storageService,
        KafkaEventBus eventBus)
    {
        _vehicleRepository = vehicleRepository;
        _policyRepository = policyRepository;
        _storageService = storageService;
        _eventBus = eventBus;
    }

    public async Task<Result<Guid>> Handle(CreatePolicyCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken);
        if (vehicle == null)
        {
            return Result.Failure<Guid>("Poliçe eklenecek araç bulunamadı.");
        }

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

        var policy = new Policy
        {
            Id = Guid.NewGuid(),
            PolicyNumber = request.PolicyNumber,
            VehicleId = request.VehicleId,
            StartDate = request.StartDate.ToUniversalTime(),
            EndDate = request.EndDate.ToUniversalTime(),
            Premium = request.Premium,
            DocumentUrl = documentUrl,
            IsActive = true
        };

        await _policyRepository.CreateAsync(policy, cancellationToken);

        // Araç sigorta bitiş tarihini güncelle
        if (vehicle.InsuranceEndDate == null || policy.EndDate > vehicle.InsuranceEndDate)
        {
            vehicle.InsuranceEndDate = policy.EndDate;
            await _vehicleRepository.UpdateAsync(vehicle, cancellationToken);
        }

        // Kafka Event Yayınla
        var policyCreatedEvent = new PolicyCreatedEvent(
            policy.Id,
            policy.PolicyNumber,
            policy.VehicleId,
            policy.StartDate,
            policy.EndDate,
            policy.Premium,
            policy.DocumentUrl
        );

        await _eventBus.PublishAsync(policyCreatedEvent, cancellationToken);

        return Result.Success(policy.Id, "Poliçe başarıyla oluşturuldu.");
    }
}
