namespace Sigortak.Identity.Domain.Enums;

/// <summary>
/// Sistem rolleri — RBAC (Role-Based Access Control) için.
/// </summary>
public enum Role
{
    /// <summary>Bireysel kullanıcı — kendi araç ve poliçelerini yönetir.</summary>
    IndividualUser = 0,

    /// <summary>Acente — müşteri portföyünü yönetir.</summary>
    Agent = 1,

    /// <summary>Filo yöneticisi — toplu araç/poliçe yönetimi.</summary>
    FleetManager = 2,

    /// <summary>Sistem yöneticisi — tam yetki.</summary>
    SystemAdmin = 3
}
