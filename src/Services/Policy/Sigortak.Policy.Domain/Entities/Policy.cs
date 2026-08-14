using Sigortak.Common.Entities;
using Sigortak.Policy.Domain.Enums;

namespace Sigortak.Policy.Domain.Entities;

/// <summary>
/// Sistemdeki poliçe bilgisini temsil eden Entity.
/// </summary>
public class Policy : AuditableEntity, IMultiTenant
{
    public Guid TenantId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string SbmPolicyNumber { get; set; } = string.Empty; // SBM Poliçe No
    public Guid VehicleId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Premium { get; set; }
    public string DocumentUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public PolicyType PolicyType { get; set; } = PolicyType.Traffic;
}
