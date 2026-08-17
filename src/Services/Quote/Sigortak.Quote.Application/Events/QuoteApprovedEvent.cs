using Sigortak.EventBus.Abstractions;

namespace Sigortak.Quote.Application.Events;

public class QuoteApprovedEvent : IntegrationEvent
{
    public Guid QuoteId { get; }
    public Guid VehicleId { get; }
    public string VehiclePlate { get; }
    public string InsuranceCompany { get; }
    public int PolicyType { get; }
    public decimal Premium { get; }
    public string PdfDocumentUrl { get; }

    public QuoteApprovedEvent(
        Guid quoteId,
        Guid vehicleId,
        string vehiclePlate,
        string insuranceCompany,
        int policyType,
        decimal premium,
        string pdfDocumentUrl)
    {
        QuoteId = quoteId;
        VehicleId = vehicleId;
        VehiclePlate = vehiclePlate;
        InsuranceCompany = insuranceCompany;
        PolicyType = policyType;
        Premium = premium;
        PdfDocumentUrl = pdfDocumentUrl;
    }
}
