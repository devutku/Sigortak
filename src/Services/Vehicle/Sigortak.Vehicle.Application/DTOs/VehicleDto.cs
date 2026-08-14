namespace Sigortak.Vehicle.Application.DTOs;

/// <summary>
/// Dış dünyaya açılacak araç veri transfer nesnesi.
/// </summary>
public class VehicleDto
{
    public Guid Id { get; set; }
    public string Plate { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string EngineNumber { get; set; } = string.Empty;
    public string EngineCapacity { get; set; } = string.Empty;
    public string ChassisNumber { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerTcNo { get; set; } = string.Empty;
    public string OwnerAddress { get; set; } = string.Empty;
    public string UsageType { get; set; } = string.Empty;
    public DateTime? TrafficRegistrationDate { get; set; }
    public string BodyType { get; set; } = string.Empty;
    public DateTime? InspectionDate { get; set; }
    public DateTime? InsuranceEndDate { get; set; }
    public bool IsActive { get; set; }

    // Muayene Kalan Gün ve Durum Hesaplamaları (Muayene geçerlilik süresi 2 yıldır)
    public int? InspectionRemainingDays
    {
        get
        {
            if (!InspectionDate.HasValue) return null;
            var nextInspectionDate = InspectionDate.Value.AddYears(2);
            return (int)(nextInspectionDate - DateTime.UtcNow.Date).TotalDays;
        }
    }

    public string InspectionStatus
    {
        get
        {
            if (!InspectionRemainingDays.HasValue) return "BELİRSİZ";
            if (InspectionRemainingDays.Value < 0) return "MUAYENE DOLDU";
            if (InspectionRemainingDays.Value <= 30) return "MUAYENE DOLMAK ÜZERE";
            return "ZAMANIN VAR";
        }
    }

    // Sigorta Kalan Gün ve Durum Hesaplamaları
    public int? InsuranceRemainingDays
    {
        get
        {
            if (!InsuranceEndDate.HasValue) return null;
            return (int)(InsuranceEndDate.Value.Date - DateTime.UtcNow.Date).TotalDays;
        }
    }

    public string InsuranceStatus
    {
        get
        {
            if (!InsuranceRemainingDays.HasValue) return "BELİRSİZ";
            if (InsuranceRemainingDays.Value < 0) return "SİGORTA DOLDU";
            if (InsuranceRemainingDays.Value <= 30) return "SİGORTA DOLMAK ÜZERE";
            return "ZAMANIN VAR";
        }
    }
    // Active policy details if available
    public Guid? PolicyId { get; set; }
    public string? PolicyNumber { get; set; }
    public string? SbmPolicyNumber { get; set; }
    public DateTime? PolicyStartDate { get; set; }
    public DateTime? PolicyEndDate { get; set; }
    public decimal? PolicyPremium { get; set; }
    public string? PolicyDocumentUrl { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
