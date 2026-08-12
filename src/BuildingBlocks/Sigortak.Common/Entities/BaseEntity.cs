namespace Sigortak.Common.Entities;

/// <summary>
/// Tüm entity'ler için temel sınıf — GUID tabanlı ID.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
}

/// <summary>
/// Denetlenebilir entity'ler için — oluşturma/güncelleme tarih ve kullanıcı bilgileri.
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
