using Sigortak.EventBus.Abstractions;

namespace Sigortak.Policy.Application.Events;

public class PolicyRenewedEvent : IntegrationEvent
{
    public Guid PolicyId { get; }
    public string PolicyNumber { get; }
    public string SbmPolicyNumber { get; }
    public Guid VehicleId { get; }
    public DateTime StartDate { get; }
    public DateTime EndDate { get; }
    public decimal Premium { get; }
    public string DocumentUrl { get; }
    public int PolicyType { get; }

    public PolicyRenewedEvent(Guid policyId, string policyNumber, string sbmPolicyNumber, Guid vehicleId, DateTime startDate, DateTime endDate, decimal premium, string documentUrl, int policyType)
    {
        PolicyId = policyId;
        PolicyNumber = policyNumber;
        SbmPolicyNumber = sbmPolicyNumber;
        VehicleId = vehicleId;
        StartDate = startDate;
        EndDate = endDate;
        Premium = premium;
        DocumentUrl = documentUrl;
        PolicyType = policyType;
    }
}
