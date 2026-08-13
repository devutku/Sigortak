using Sigortak.Common.Entities;

namespace Sigortak.Vehicle.Domain.Entities;

/// <summary>
/// Sistemdeki poliçe bilgisini temsil eden Entity.
/// </summary>
public class Policy : AuditableEntity
{
    public string PolicyNumber { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Premium { get; set; }
    public string DocumentUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
