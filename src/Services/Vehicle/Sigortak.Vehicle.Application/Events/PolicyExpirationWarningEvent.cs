using Sigortak.EventBus.Abstractions;

namespace Sigortak.Vehicle.Application.Events;

public class PolicyExpirationWarningEvent : IntegrationEvent
{
    public Guid PolicyId { get; }
    public string PolicyNumber { get; }
    public Guid VehicleId { get; }
    public int RemainingDays { get; }
    public string CustomerPhone { get; }
    public string CustomerEmail { get; }

    public PolicyExpirationWarningEvent(Guid policyId, string policyNumber, Guid vehicleId, int remainingDays, string customerPhone, string customerEmail)
    {
        PolicyId = policyId;
        PolicyNumber = policyNumber;
        VehicleId = vehicleId;
        RemainingDays = remainingDays;
        CustomerPhone = customerPhone;
        CustomerEmail = customerEmail;
    }
}
