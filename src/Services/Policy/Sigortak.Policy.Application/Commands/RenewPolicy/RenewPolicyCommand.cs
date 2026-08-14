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

    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}
