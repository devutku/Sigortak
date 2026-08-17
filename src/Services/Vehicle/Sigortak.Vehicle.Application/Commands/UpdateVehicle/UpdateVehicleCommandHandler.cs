using MediatR;
using Sigortak.Common.Exceptions;
using Sigortak.Common.Models;
using Sigortak.EventBus.Kafka;
using Sigortak.Vehicle.Application.Events;
using Sigortak.Vehicle.Domain.Interfaces;

namespace Sigortak.Vehicle.Application.Commands.UpdateVehicle;

/// <summary>
/// Araç güncelleme komut işleyicisi.
/// </summary>
public class UpdateVehicleCommandHandler : IRequestHandler<UpdateVehicleCommand, Result<bool>>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly KafkaEventBus _kafkaEventBus;

    public UpdateVehicleCommandHandler(
        IVehicleRepository vehicleRepository,
        KafkaEventBus kafkaEventBus)
    {
        _vehicleRepository = vehicleRepository;
        _kafkaEventBus = kafkaEventBus;
    }

    public async Task<Result<bool>> Handle(UpdateVehicleCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (vehicle == null)
            throw new NotFoundException("Vehicle", request.Id);

        vehicle.Brand = request.Brand;
        vehicle.Model = request.Model;
        vehicle.Year = request.Year;
        vehicle.EngineNumber = request.EngineNumber;
        vehicle.ChassisNumber = request.ChassisNumber;
        vehicle.BodyType = request.BodyType;
        vehicle.InspectionDate = request.InspectionDate;
        vehicle.InspectionPassed = request.InspectionPassed;
        vehicle.InspectionDocumentUrl = request.InspectionDocumentUrl;
        vehicle.InsuranceEndDate = request.InsuranceEndDate;

        await _vehicleRepository.UpdateAsync(vehicle, cancellationToken);

        // Kafka üzerinden Read-DB (Redis) senkronizasyon event'i fırlat
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

        return Result.Success(true, "Araç başarıyla güncellendi.");
    }
}
