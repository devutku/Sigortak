using Sigortak.Common.Entities;
using Sigortak.Quote.Domain.Enums;

namespace Sigortak.Quote.Domain.Entities;

/// <summary>
/// Sistemdeki sigorta tekliflerini temsil eden Entity.
/// </summary>
public class Quote : AuditableEntity, IMultiTenant
{
    public Guid TenantId { get; set; }
    public Guid VehicleId { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;
    public string VehicleInfo { get; set; } = string.Empty;
    public string InsuranceCompany { get; set; } = string.Empty;
    public string AgentName { get; set; } = string.Empty;
    public PolicyType PolicyType { get; set; } = PolicyType.Traffic;
    public decimal Premium { get; set; }
    public DateTime ValidityDate { get; set; }
    public QuoteStatus Status { get; set; } = QuoteStatus.Pending;

    // Teminat Kapsamları
    public string ImmLimit { get; set; } = string.Empty;
    public string ReplacementCarDuration { get; set; } = string.Empty;
    public string ExemptStatus { get; set; } = string.Empty;
    public bool GlassCovered { get; set; }
    public string AsstServices { get; set; } = string.Empty;

    public string PdfDocumentUrl { get; set; } = string.Empty;
}
