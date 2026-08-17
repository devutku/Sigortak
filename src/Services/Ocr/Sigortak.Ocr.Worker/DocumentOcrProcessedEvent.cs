using Sigortak.EventBus.Abstractions;

namespace Sigortak.Ocr.Worker;

public class DocumentOcrProcessedEvent : IntegrationEvent
{
    public Guid DocumentId { get; }
    public string Plate { get; }
    public string ChassisNumber { get; }
    public decimal Premium { get; }
    public string InsuranceCompany { get; }

    public DocumentOcrProcessedEvent(Guid documentId, string plate, string chassisNumber, decimal premium, string insuranceCompany)
    {
        DocumentId = documentId;
        Plate = plate;
        ChassisNumber = chassisNumber;
        Premium = premium;
        InsuranceCompany = insuranceCompany;
    }
}
