using MediatR;
using Sigortak.Common.Models;
using Sigortak.Policy.Domain.Enums;

namespace Sigortak.Policy.Application.Commands.CreatePolicy;

public class CreatePolicyCommand : IRequest<Result<Guid>>
{
    public string PolicyNumber { get; set; } = string.Empty;
    public string SbmPolicyNumber { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Premium { get; set; }
    public PolicyType PolicyType { get; set; } = PolicyType.Traffic;
    
    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}
