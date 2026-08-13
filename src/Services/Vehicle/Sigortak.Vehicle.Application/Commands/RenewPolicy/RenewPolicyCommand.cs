using MediatR;
using Sigortak.Common.Models;

namespace Sigortak.Vehicle.Application.Commands.RenewPolicy;

public class RenewPolicyCommand : IRequest<Result<Guid>>
{
    public Guid VehicleId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Premium { get; set; }

    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}
