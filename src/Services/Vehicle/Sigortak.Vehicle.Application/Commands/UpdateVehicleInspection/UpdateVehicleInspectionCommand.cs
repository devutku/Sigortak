using MediatR;
using Sigortak.Common.Exceptions;
using Sigortak.Common.Models;
using Sigortak.EventBus.Kafka;
using Sigortak.Vehicle.Application.Events;
using Sigortak.Vehicle.Domain.Interfaces;

namespace Sigortak.Vehicle.Application.Commands.UpdateVehicleInspection;

public record UpdateVehicleInspectionCommand(
    Guid VehicleId,
    DateTime? InspectionDate,
    bool? InspectionPassed,
    string? InspectionDocumentUrl
) : IRequest<Result<bool>>;

public class UpdateVehicleInspectionCommandHandler : IRequestHandler<UpdateVehicleInspectionCommand, Result<bool>>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly KafkaEventBus _kafkaEventBus;

    public UpdateVehicleInspectionCommandHandler(
        IVehicleRepository vehicleRepository,
        KafkaEventBus kafkaEventBus)
    {
        _vehicleRepository = vehicleRepository;
        _kafkaEventBus = kafkaEventBus;
    }

    public async Task<Result<bool>> Handle(UpdateVehicleInspectionCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken);
        if (vehicle == null)
            throw new NotFoundException("Vehicle", request.VehicleId);

        vehicle.InspectionDate = request.InspectionDate;
        vehicle.InspectionPassed = request.InspectionPassed;
        if (request.InspectionDocumentUrl != null)
        {
            vehicle.InspectionDocumentUrl = request.InspectionDocumentUrl;
        }

        await _vehicleRepository.UpdateAsync(vehicle, cancellationToken);

        // Publish sync event to update Read DB and Redis
        var syncEvent = new VehicleCreatedEvent(
            vehicle.Id,
            vehicle.Plate,
            vehicle.Brand,
            vehicle.Model,
            vehicle.Year,
            vehicle.OwnerId,
            vehicle.OwnerName,
            vehicle.OwnerTcNo,
            vehicle.OwnerAddress,
            vehicle.UsageType,
            vehicle.TrafficRegistrationDate,
            vehicle.BodyType,
            vehicle.InspectionDate,
            vehicle.InspectionPassed,
            vehicle.InspectionDocumentUrl,
            vehicle.InsuranceEndDate
        );
        await _kafkaEventBus.PublishAsync(syncEvent, cancellationToken);

        return Result.Success(true, "Araç muayene bilgileri başarıyla güncellendi.");
    }
}
