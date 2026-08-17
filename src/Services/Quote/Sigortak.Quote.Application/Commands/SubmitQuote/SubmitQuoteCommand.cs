using MediatR;
using Sigortak.Common.Models;
using Sigortak.Quote.Domain.Enums;

namespace Sigortak.Quote.Application.Commands.SubmitQuote;

public class SubmitQuoteCommand : IRequest<Result<Guid>>
{
    public Guid VehicleId { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;
    public string VehicleInfo { get; set; } = string.Empty;
    public string InsuranceCompany { get; set; } = string.Empty;
    public string AgentName { get; set; } = string.Empty;
    public PolicyType PolicyType { get; set; } = PolicyType.Traffic;
    public decimal Premium { get; set; }
    public DateTime ValidityDate { get; set; }

    public string ImmLimit { get; set; } = string.Empty;
    public string ReplacementCarDuration { get; set; } = string.Empty;
    public string ExemptStatus { get; set; } = string.Empty;
    public bool GlassCovered { get; set; }
    public string AsstServices { get; set; } = string.Empty;

    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}
