using Sigortak.Common.Entities;
using Sigortak.Identity.Domain.Enums;

namespace Sigortak.Identity.Domain.Entities;

/// <summary>
/// Sistem kullanıcısı — kimlik doğrulama ve yetkilendirme için temel entity.
/// </summary>
public class User : AuditableEntity, IMultiTenant
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public Role Role { get; set; } = Role.IndividualUser;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public Guid TenantId { get; set; }

    /// <summary>Navigation property — kullanıcının refresh token'ları.</summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public string FullName => $"{FirstName} {LastName}".Trim();
}
