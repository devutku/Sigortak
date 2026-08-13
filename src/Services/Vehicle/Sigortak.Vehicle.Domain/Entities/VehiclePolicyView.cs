namespace Sigortak.Vehicle.Domain.Entities;

public class VehiclePolicyView
{
    public Guid VehicleId { get; set; }
    public string Plate { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string BodyType { get; set; } = string.Empty;
    public string EngineCapacity { get; set; } = string.Empty;
    public string ChassisNumber { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public DateTime? InspectionDate { get; set; }
    
    // Policy fields
    public Guid? PolicyId { get; set; }
    public string? PolicyNumber { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? Premium { get; set; }
    public string? DocumentUrl { get; set; }
    public bool? PolicyIsActive { get; set; }
    
    public DateTime UpdatedAt { get; set; }
}
