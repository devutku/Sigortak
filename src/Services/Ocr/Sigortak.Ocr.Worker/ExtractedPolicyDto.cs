namespace Sigortak.Ocr.Worker;

public class ExtractedPolicyDto
{
    public string? CompanyName { get; set; }
    public string? PolicyNumber { get; set; }
    public string? RenewalNumber { get; set; }
    public string? PlateNumber { get; set; }
    public string? IdentityOrTaxNumber { get; set; }
    public string? VehicleInfo { get; set; }
    public int? ModelYear { get; set; }
    public decimal? NetPremium { get; set; }
    public decimal? GrossPremium { get; set; }
    public decimal? Commission { get; set; }
    public string? RawText { get; set; }
}
