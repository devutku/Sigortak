using Sigortak.EventBus.Abstractions;
using Sigortak.Vehicle.Domain.Enums;

namespace Sigortak.Vehicle.Application.Events;

/// <summary>
/// Araç başarıyla oluşturulduğunda Kafka'ya fırlatılacak olay.
/// </summary>
public class VehicleCreatedEvent : IntegrationEvent
{
    public Guid VehicleId { get; }
    public string Plate { get; }
    public string Brand { get; }
    public string Model { get; }
    public int Year { get; }
    public Guid OwnerId { get; }
    public VehicleBodyType BodyType { get; }
    public DateTime? InspectionDate { get; }
    public DateTime? InsuranceEndDate { get; }

    public VehicleCreatedEvent(Guid vehicleId, string plate, string brand, string model, int year, Guid ownerId, VehicleBodyType bodyType, DateTime? inspectionDate, DateTime? insuranceEndDate)
    {
        VehicleId = vehicleId;
        Plate = plate;
        Brand = brand;
        Model = model;
        Year = year;
        OwnerId = ownerId;
        BodyType = bodyType;
        InspectionDate = inspectionDate;
        InsuranceEndDate = insuranceEndDate;
    }
}
