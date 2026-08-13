using Sigortak.EventBus.Abstractions;
using Sigortak.Vehicle.Domain.Enums;

namespace Sigortak.Vehicle.Application.Commands.CreateVehicle;

/// <summary>
/// Araç oluşturma komutu — asenkron işlenmek üzere RabbitMQ'ya gönderilir.
/// </summary>
public class CreateVehicleCommand : IntegrationEvent
{
    public string Plate { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string EngineNumber { get; set; } = string.Empty;
    public string EngineCapacity { get; set; } = string.Empty;
    public string ChassisNumber { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public VehicleBodyType BodyType { get; set; } = VehicleBodyType.Sedan;
    public DateTime? InspectionDate { get; set; }
    public DateTime? InsuranceEndDate { get; set; }
}
