using MediatR;
using Sigortak.Common.Models;

namespace Sigortak.Vehicle.Application.Commands.CreatePolicy;

public class CreatePolicyCommand : IRequest<Result<Guid>>
{
    public string PolicyNumber { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Premium { get; set; }
    
    // File stream details (not serialized if sent across network, but we use it locally in the controller -> handler flow)
    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}
