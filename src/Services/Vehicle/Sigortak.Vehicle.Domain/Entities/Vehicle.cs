using Sigortak.Common.Entities;

namespace Sigortak.Vehicle.Domain.Entities;

/// <summary>
/// Sistemdeki araç bilgisini temsil eden Entity.
/// </summary>
public class Vehicle : AuditableEntity
{
    public string Plate { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string EngineNumber { get; set; } = string.Empty;
    public string ChassisNumber { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public Enums.VehicleBodyType BodyType { get; set; } = Enums.VehicleBodyType.Sedan;
    public bool IsActive { get; set; } = true;
}
