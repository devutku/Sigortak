namespace Sigortak.Ocr.Worker;

public class ExtractedPolicyDto
{
    public string? VehicleId { get; set; }
    public string? PolicyNumber { get; set; }
    public string? RenewalNumber { get; set; }
    public string? CompanyName { get; set; }
    public string? AgencyCode { get; set; }
    public string? PolicyType { get; set; } // KASKO | TRAFIK
    public string? PlateNumber { get; set; }
    public string? IdentityOrTaxNumber { get; set; }
    public string? VehicleInfo { get; set; }
    public int? ModelYear { get; set; }

    // Finansal & Prim Kırılımları
    public decimal? NetPremium { get; set; }
    public decimal? GrossPremium { get; set; }
    public decimal? Commission { get; set; }
    public decimal? VehicleValue { get; set; }

    // Kritik Teminatlar
    public string? ImmLimit { get; set; }
    public decimal? PersonalAccidentCoverage { get; set; }
    public decimal? LegalProtection { get; set; }

    // Hasarsızlık & Tramer
    public int? NoClaimDiscountRate { get; set; }
    public int? NoClaimStep { get; set; }
    public string? TramerDocumentNo { get; set; }
    public string? TramerDocumentDate { get; set; }

    // İndirimler & Şartlar
    public List<string> Discounts { get; set; } = new();
    public List<string> ExtraCoverages { get; set; } = new();
    public string? RawText { get; set; }

    // Owner and vehicle ruhsat details (Extracted)
    public string? OwnerName { get; set; }
    public string? OwnerAddress { get; set; }
    public string? UsageType { get; set; }
    public string? EngineNumber { get; set; }
    public string? ChassisNumber { get; set; }
    public string? DainiMurtehin { get; set; }
}
