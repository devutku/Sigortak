using MediatR;
using Sigortak.Common.Models;
using Sigortak.Policy.Domain.Enums;

namespace Sigortak.Policy.Application.Commands.RenewPolicy;

public class RenewPolicyCommand : IRequest<Result<Guid>>
{
    public Guid VehicleId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string SbmPolicyNumber { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Premium { get; set; }
    public PolicyType PolicyType { get; set; } = PolicyType.Traffic;

    // Extended fields
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

    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}
