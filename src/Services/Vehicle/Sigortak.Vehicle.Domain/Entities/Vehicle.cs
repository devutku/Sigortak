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
    public string EngineCapacity { get; set; } = string.Empty; // Motor hacmi (ör: "1.6", "2.0")
    public string ChassisNumber { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty; // Ruhsat numarası
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty; // Araç sahibi adı
    public string OwnerTcNo { get; set; } = string.Empty; // T.C. Kimlik / Vergi No
    public string OwnerAddress { get; set; } = string.Empty; // Adres
    public string UsageType { get; set; } = string.Empty; // Kullanım Tarzı
    public DateTime? TrafficRegistrationDate { get; set; } // Trafik Tescil Tarihi
    public Enums.VehicleBodyType BodyType { get; set; } = Enums.VehicleBodyType.Sedan;
    public DateTime? InspectionDate { get; set; }
    public DateTime? InsuranceEndDate { get; set; }
    public bool IsActive { get; set; } = true;
}
