namespace Sigortak.Vehicle.Application.DTOs;

/// <summary>
/// Dış dünyaya açılacak araç veri transfer nesnesi.
/// </summary>
public class VehicleDto
{
    public Guid Id { get; set; }
    public string Plate { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string EngineNumber { get; set; } = string.Empty;
    public string ChassisNumber { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public string BodyType { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
