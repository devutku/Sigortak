using Sigortak.Identity.Domain.Entities;

namespace Sigortak.Identity.Application.Interfaces;

/// <summary>
/// JWT token servisi arayüzü — access token ve refresh token üretimi.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>JWT access token oluşturur.</summary>
    string GenerateAccessToken(User user);

    /// <summary>Refresh token oluşturur.</summary>
    RefreshToken GenerateRefreshToken(string ipAddress);

    /// <summary>Access token'ın geçerlilik süresini döndürür.</summary>
    DateTime GetAccessTokenExpiry();
}
