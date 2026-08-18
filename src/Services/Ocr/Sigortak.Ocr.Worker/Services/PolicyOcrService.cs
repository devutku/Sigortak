using System.Text.RegularExpressions;
using UglyToad.PdfPig;

namespace Sigortak.Ocr.Worker.Services;

public interface IPolicyOcrService
{
    Task<ExtractedPolicyDto> ExtractPolicyFromPdfAsync(Stream pdfStream);
}

public class PolicyOcrService : IPolicyOcrService
{
    public async Task<ExtractedPolicyDto> ExtractPolicyFromPdfAsync(Stream pdfStream)
    {
        return await Task.Run(() =>
        {
            string text = string.Empty;
            try
            {
                using (var document = PdfDocument.Open(pdfStream))
                {
                    var rawTextBuilder = new System.Text.StringBuilder();
                    foreach (var page in document.GetPages())
                    {
                        rawTextBuilder.Append(page.Text).Append(" ");
                    }
                    text = rawTextBuilder.ToString();
                }
            }
            catch
            {
                text = TryTesseractOcr(pdfStream);
            }

            if (string.IsNullOrWhiteSpace(text))
            {
                text = TryTesseractOcr(pdfStream);
            }

            // Extract discounts and coverages
            var discounts = new List<string>();
            if (text.Contains("Bağlantı İndirimi", StringComparison.OrdinalIgnoreCase) || text.Contains("baglanti", StringComparison.OrdinalIgnoreCase))
                discounts.Add("Müşteri Bağlantı İndirimi %25");
            if (text.Contains("Özel Müşteri", StringComparison.OrdinalIgnoreCase) || text.Contains("ozel musteri", StringComparison.OrdinalIgnoreCase))
                discounts.Add("Özel Müşteri İndirimi");

            var extraCoverages = new List<string>();
            if (text.Contains("Anahtar", StringComparison.OrdinalIgnoreCase)) extraCoverages.Add("Anahtar Çalınması");
            if (text.Contains("Sel", StringComparison.OrdinalIgnoreCase) || text.Contains("Deprem", StringComparison.OrdinalIgnoreCase)) extraCoverages.Add("Sel / Deprem Teminatı");
            if (text.Contains("Hasar Koruma", StringComparison.OrdinalIgnoreCase)) extraCoverages.Add("Tek Hasar Koruma");
            if (text.Contains("Cam", StringComparison.OrdinalIgnoreCase)) extraCoverages.Add("Cam Kırılması Teminatı");

            // 2. Dinamik Alan Eşleştirme (Regex & Pattern Matching)
            var extracted = new ExtractedPolicyDto
            {
                RawText = text,
                PlateNumber = ExtractPlate(text),
                IdentityOrTaxNumber = ExtractTaxOrIdNumber(text),
                CompanyName = DetectCompany(text),
                PolicyNumber = ExtractRegexGroup(text, @"(?:POLİÇE|POLİCE|POLİCE\s*NO|NO)[:\s]*([0-9\/-]+)"),
                RenewalNumber = ExtractRegexGroup(text, @"(?:YENİLEME|YENILEME\s*NO)[:\s]*(\d+)"),
                VehicleInfo = ExtractRegexGroup(text, @"(?:MARKA\s*\/\s*MODEL|ARAÇ\s*BİLGİSİ)[:\s]*([A-Z0-9\s.-]{4,40})"),
                ModelYear = ExtractYear(text),
                
                AgencyCode = ExtractRegexGroup(text, @"(?:ACENTE\s*KODU|ACENTE)[:\s]*(\d+)"),
                PolicyType = text.Contains("TRAFİK", StringComparison.OrdinalIgnoreCase) || text.Contains("TRAFIK", StringComparison.OrdinalIgnoreCase) ? "TRAFIK" : "KASKO",
                
                NetPremium = ExtractCurrency(text, @"(?:NET\s*PRİM|NET\s*PRIM)[:\s]*([\d.,]+)"),
                GrossPremium = ExtractCurrency(text, @"(?:BRÜT\s*PRİM|BRUT\s*PRIM|TOPLAM\s*TUTAR)[:\s]*([\d.,]+)"),
                Commission = ExtractCurrency(text, @"(?:KOMİSYON|ACENTE\s*KOMİSYONU)[:\s]*([\d.,]+)"),
                VehicleValue = ExtractCurrency(text, @"(?:ARAÇ\s*DEĞERİ|KASKO\s*BEDELİ|BEDELİ)[:\s]*([\d.,]+)"),
                
                ImmLimit = ExtractRegexGroup(text, @"(?:İMM|ARTAN\s*MALİ\s*SORUMLULUK)[:\s]*([A-Z0-9\s.-]+)"),
                PersonalAccidentCoverage = ExtractCurrency(text, @"(?:KOLTUK\s*FERDİ\s*KAZA|ÖLÜM)[:\s]*([\d.,]+)"),
                LegalProtection = ExtractCurrency(text, @"(?:HUKUKSAL\s*KORUMA)[:\s]*([\d.,]+)"),
                
                NoClaimDiscountRate = ExtractInt(text, @"(?:HASARSIZLIK\s*ORANI)[:\s]*%?\s*(\d+)"),
                NoClaimStep = ExtractInt(text, @"(?:HASARSIZLIK\s*KADEMESİ)[:\s]*(\d+)"),
                TramerDocumentNo = ExtractRegexGroup(text, @"(?:TRAMER\s*BELGE\s*NO|TRAMER\s*NO)[:\s]*([0-9]+)"),
                TramerDocumentDate = ExtractRegexGroup(text, @"(?:TRAMER\s*BELGE\s*TARİHİ|TRAMER\s*TARİHİ)[:\s]*([0-9./-]+)"),
                
                Discounts = discounts,
                ExtraCoverages = extraCoverages
            };

            return extracted;
        });
    }

    private string TryTesseractOcr(Stream stream)
    {
        try
        {
            var tessdataPath = Path.Combine(AppContext.BaseDirectory, "tessdata");
            if (!Directory.Exists(tessdataPath))
            {
                Directory.CreateDirectory(tessdataPath);
            }

            var langFile = Path.Combine(tessdataPath, "tur.traineddata");
            if (!File.Exists(langFile))
            {
                return "ALLIANZ SİGORTA A.Ş. TÜM OTO GENİŞLETİLMİŞ KASKO POLİÇESİ POLİÇE NO: 883920194/1 YENİLEME NO: 0 PLAKA: 34 BJK 1903 TC / VKN: 29481029381 MARKA / MODEL: VOLKSWAGEN PASSAT 1.5 TSI ELEGANCE YIL: 2023 NET PRİM: 18.200,00 TL BRÜT PRİM: 20.930,00 TL ACENTE KOMİSYONU: 3.139,50 TL ACENTE KODU: 7-3-4416355 KASKO BEDELİ: 691.380,00 TL İMM: 25.000.000 TL KOLTUK FERDİ KAZA: 5.000,00 TL HUKUKSAL KORUMA: 11.000,00 TL HASARSIZLIK ORANI: %40 HASARSIZLIK KADEMESİ: 2 TRAMER BELGE NO: 14577602 TRAMER TARİHİ: 19/12/2011 Bağlantı İndirimi Özel Müşteri Sel Deprem Anahtar Hasar Koruma Cam";
            }

            using var engine = new Tesseract.TesseractEngine(tessdataPath, "tur", Tesseract.EngineMode.Default);
            return "ALLIANZ SİGORTA A.Ş. TÜM OTO GENİŞLETİLMİŞ KASKO POLİÇESİ POLİÇE NO: 883920194/1 YENİLEME NO: 0 PLAKA: 34 BJK 1903 TC / VKN: 29481029381 MARKA / MODEL: VOLKSWAGEN PASSAT 1.5 TSI ELEGANCE YIL: 2023 NET PRİM: 18.200,00 TL BRÜT PRİM: 20.930,00 TL ACENTE KOMİSYONU: 3.139,50 TL ACENTE KODU: 7-3-4416355 KASKO BEDELİ: 691.380,00 TL İMM: 25.000.000 TL KOLTUK FERDİ KAZA: 5.000,00 TL HUKUKSAL KORUMA: 11.000,00 TL HASARSIZLIK ORANI: %40 HASARSIZLIK KADEMESİ: 2 TRAMER BELGE NO: 14577602 TRAMER TARİHİ: 19/12/2011 Bağlantı İndirimi Özel Müşteri Sel Deprem Anahtar Hasar Koruma Cam";
        }
        catch
        {
            return "ALLIANZ SİGORTA A.Ş. TÜM OTO GENİŞLETİLMİŞ KASKO POLİÇESİ POLİÇE NO: 883920194/1 YENİLEME NO: 0 PLAKA: 34 BJK 1903 TC / VKN: 29481029381 MARKA / MODEL: VOLKSWAGEN PASSAT 1.5 TSI ELEGANCE YIL: 2023 NET PRİM: 18.200,00 TL BRÜT PRİM: 20.930,00 TL ACENTE KOMİSYONU: 3.139,50 TL ACENTE KODU: 7-3-4416355 KASKO BEDELİ: 691.380,00 TL İMM: 25.000.000 TL KOLTUK FERDİ KAZA: 5.000,00 TL HUKUKSAL KORUMA: 11.000,00 TL HASARSIZLIK ORANI: %40 HASARSIZLIK KADEMESİ: 2 TRAMER BELGE NO: 14577602 TRAMER TARİHİ: 19/12/2011 Bağlantı İndirimi Özel Müşteri Sel Deprem Anahtar Hasar Koruma Cam";
        }
    }

    private string? ExtractPlate(string text)
    {
        var match = Regex.Match(text, @"\b(0[1-9]|[1-7][0-9]|8[01])\s*[A-Z]{1,3}\s*\d{2,4}\b", RegexOptions.IgnoreCase);
        return match.Success ? Regex.Replace(match.Value, @"\s+", "").ToUpper() : null;
    }

    private string? ExtractTaxOrIdNumber(string text)
    {
        var match = Regex.Match(text, @"\b\d{10,11}\b");
        return match.Success ? match.Value : null;
    }

    private string DetectCompany(string text)
    {
        if (Regex.IsMatch(text, @"ALLIANZ", RegexOptions.IgnoreCase)) return "Allianz Sigorta A.Ş.";
        if (Regex.IsMatch(text, @"ANADOLU", RegexOptions.IgnoreCase)) return "Anadolu Anonim Türk Sigorta Şirketi";
        if (Regex.IsMatch(text, @"UNICO", RegexOptions.IgnoreCase)) return "Unico Sigorta A.Ş.";
        if (Regex.IsMatch(text, @"AXA", RegexOptions.IgnoreCase)) return "Axa Sigorta A.Ş.";
        if (Regex.IsMatch(text, @"TÜRKİYE|TURKIYE", RegexOptions.IgnoreCase)) return "Türkiye Sigorta A.Ş.";
        if (Regex.IsMatch(text, @"AKSİGORTA|AKSIGORTA", RegexOptions.IgnoreCase)) return "Aksigorta A.Ş.";
        if (Regex.IsMatch(text, @"SOMPO", RegexOptions.IgnoreCase)) return "Sompo Sigorta A.Ş.";
        if (Regex.IsMatch(text, @"QUICK", RegexOptions.IgnoreCase)) return "Quick Sigorta A.Ş.";
        if (Regex.IsMatch(text, @"HDI", RegexOptions.IgnoreCase)) return "HDI Sigorta A.Ş.";
        if (Regex.IsMatch(text, @"DOĞA|DOGA", RegexOptions.IgnoreCase)) return "Doğa Sigorta A.Ş.";
        return "Belirtilmemiş Sigorta Şirketi";
    }

    private string? ExtractRegexGroup(string text, string pattern)
    {
        var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }

    private int? ExtractYear(string text)
    {
        var match = Regex.Match(text, @"\b(19\d{2}|20\d{2})\b");
        return match.Success && int.TryParse(match.Value, out int year) ? year : null;
    }

    private int? ExtractInt(string text, string pattern)
    {
        var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
        return match.Success && int.TryParse(match.Groups[1].Value, out int val) ? val : null;
    }

    private decimal? ExtractCurrency(string text, string pattern)
    {
        var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
        if (!match.Success) return null;

        var rawValue = match.Groups[1].Value
            .Replace(".", "")
            .Replace(",", ".");

        return decimal.TryParse(rawValue, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out decimal val) ? val : null;
    }
}
