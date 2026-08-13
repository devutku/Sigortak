using Sigortak.EventBus.Abstractions;

namespace Sigortak.Vehicle.Application.Events;

public class PolicyRenewedEvent : IntegrationEvent
{
    public Guid PolicyId { get; }
    public string PolicyNumber { get; }
    public Guid VehicleId { get; }
    public DateTime StartDate { get; }
    public DateTime EndDate { get; }
    public decimal Premium { get; }
    public string DocumentUrl { get; }

    public PolicyRenewedEvent(Guid policyId, string policyNumber, Guid vehicleId, DateTime startDate, DateTime endDate, decimal premium, string documentUrl)
    {
        PolicyId = policyId;
        PolicyNumber = policyNumber;
        VehicleId = vehicleId;
        StartDate = startDate;
        EndDate = endDate;
        Premium = premium;
        DocumentUrl = documentUrl;
    }
}
