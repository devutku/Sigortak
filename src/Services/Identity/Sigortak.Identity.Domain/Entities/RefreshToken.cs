using Sigortak.Common.Entities;

namespace Sigortak.Identity.Domain.Entities;

/// <summary>
/// Refresh token — JWT yenileme mekanizması için kullanılır.
/// Her login'de yeni bir refresh token oluşturulur.
/// </summary>
public class RefreshToken : BaseEntity
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedByIp { get; set; } = string.Empty;
    public DateTime? RevokedAt { get; set; }
    public string? RevokedByIp { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? ReasonRevoked { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsRevoked && !IsExpired;

    /// <summary>FK — token sahibi kullanıcı.</summary>
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
