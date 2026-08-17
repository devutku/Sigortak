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
    public string OwnerName { get; }
    public string OwnerTcNo { get; }
    public string OwnerAddress { get; }
    public string UsageType { get; }
    public DateTime? TrafficRegistrationDate { get; }
    public VehicleBodyType BodyType { get; }
    public DateTime? InspectionDate { get; }
    public bool? InspectionPassed { get; }
    public string? InspectionDocumentUrl { get; }
    public DateTime? InsuranceEndDate { get; }

    public VehicleCreatedEvent(
        Guid vehicleId, 
        string plate, 
        string brand, 
        string model, 
        int year, 
        Guid ownerId, 
        string ownerName,
        string ownerTcNo,
        string ownerAddress,
        string usageType,
        DateTime? trafficRegistrationDate,
        VehicleBodyType bodyType, 
        DateTime? inspectionDate, 
        bool? inspectionPassed,
        string? inspectionDocumentUrl,
        DateTime? insuranceEndDate)
    {
        VehicleId = vehicleId;
        Plate = plate;
        Brand = brand;
        Model = model;
        Year = year;
        OwnerId = ownerId;
        OwnerName = ownerName;
        OwnerTcNo = ownerTcNo;
        OwnerAddress = ownerAddress;
        UsageType = usageType;
        TrafficRegistrationDate = trafficRegistrationDate;
        BodyType = bodyType;
        InspectionDate = inspectionDate;
        InspectionPassed = inspectionPassed;
        InspectionDocumentUrl = inspectionDocumentUrl;
        InsuranceEndDate = insuranceEndDate;
    }
}
