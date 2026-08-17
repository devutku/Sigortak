using Sigortak.EventBus.Abstractions;

namespace Sigortak.Quote.Application.Events;

public class QuoteReceivedEvent : IntegrationEvent
{
    public Guid QuoteId { get; }
    public Guid VehicleId { get; }
    public string VehiclePlate { get; }
    public string VehicleInfo { get; }
    public string InsuranceCompany { get; }
    public string AgentName { get; }
    public int PolicyType { get; }
    public decimal Premium { get; }
    public DateTime ValidityDate { get; }
    public string ImmLimit { get; }
    public string ReplacementCarDuration { get; }
    public string ExemptStatus { get; }
    public bool GlassCovered { get; }
    public string AsstServices { get; }
    public string PdfDocumentUrl { get; }

    public QuoteReceivedEvent(
        Guid quoteId,
        Guid vehicleId,
        string vehiclePlate,
        string vehicleInfo,
        string insuranceCompany,
        string agentName,
        int policyType,
        decimal premium,
        DateTime validityDate,
        string immLimit,
        string replacementCarDuration,
        string exemptStatus,
        bool glassCovered,
        string asstServices,
        string pdfDocumentUrl)
    {
        QuoteId = quoteId;
        VehicleId = vehicleId;
        VehiclePlate = vehiclePlate;
        VehicleInfo = vehicleInfo;
        InsuranceCompany = insuranceCompany;
        AgentName = agentName;
        PolicyType = policyType;
        Premium = premium;
        ValidityDate = validityDate;
        ImmLimit = immLimit;
        ReplacementCarDuration = replacementCarDuration;
        ExemptStatus = exemptStatus;
        GlassCovered = glassCovered;
        AsstServices = asstServices;
        PdfDocumentUrl = pdfDocumentUrl;
    }
}
