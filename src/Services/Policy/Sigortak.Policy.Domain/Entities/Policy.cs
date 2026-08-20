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

    // Extended Attributes
    public string CompanyName { get; set; } = string.Empty;
    public string RenewalNumber { get; set; } = "0";
    public string AgencyCode { get; set; } = string.Empty;
    public decimal NetPremium { get; set; }
    public decimal Commission { get; set; }
    public decimal? VehicleValue { get; set; }
    public string ImmLimit { get; set; } = string.Empty;
    public decimal? PersonalAccidentCoverage { get; set; }
    public decimal? LegalProtection { get; set; }
    public int? NoClaimDiscountRate { get; set; }
    public int? NoClaimStep { get; set; }
    public string TramerDocumentNo { get; set; } = string.Empty;
    public DateTime? TramerDocumentDate { get; set; }
    public List<string> Discounts { get; set; } = new();
    public List<string> ExtraCoverages { get; set; } = new();

    // Payment Status
    public bool IsPaid { get; set; } = false;
    public DateTime? PaymentDate { get; set; }
    public string PaymentNote { get; set; } = string.Empty;
}
