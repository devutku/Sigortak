using Sigortak.Common.Exceptions;
using Sigortak.Common.Models;
using Sigortak.CQRS.Commands;
using Sigortak.Identity.Application.DTOs;
using Sigortak.Identity.Application.Interfaces;

namespace Sigortak.Identity.Application.Commands.RefreshToken;

/// <summary>
/// RefreshToken handler — token rotation ile güvenli yenileme.
/// Eski token revoke edilir, yeni çift üretilir.
/// </summary>
public class RefreshTokenCommandHandler : ICommandHandler<RefreshTokenCommand, Result<AuthResponseDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;

    public RefreshTokenCommandHandler(
        IUserRepository userRepository,
        IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // Tüm kullanıcıları refresh token'larıyla birlikte getir
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var user = users.FirstOrDefault(u =>
            u.RefreshTokens.Any(t => t.Token == request.Token));

        if (user == null)
            throw new BusinessException("Geçersiz refresh token.");

        var currentToken = user.RefreshTokens.Single(t => t.Token == request.Token);

        if (!currentToken.IsActive)
        {
            // Eğer kullanılmış bir token tekrar kullanılıyorsa, tüm token'ları revoke et (güvenlik)
            foreach (var token in user.RefreshTokens.Where(t => t.IsActive))
            {
                token.RevokedAt = DateTime.UtcNow;
                token.RevokedByIp = request.IpAddress;
                token.ReasonRevoked = "Şüpheli token yeniden kullanım denemesi";
            }
            await _userRepository.UpdateAsync(user, cancellationToken);
            throw new BusinessException("Token artık geçerli değil. Güvenlik nedeniyle tüm oturumlar kapatıldı.");
        }

        // Eski token'ı revoke et
        currentToken.RevokedAt = DateTime.UtcNow;
        currentToken.RevokedByIp = request.IpAddress;
        currentToken.ReasonRevoked = "Yeni token ile değiştirildi";

        // Yeni refresh token oluştur
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken(request.IpAddress);
        newRefreshToken.UserId = user.Id;
        currentToken.ReplacedByToken = newRefreshToken.Token;
        user.RefreshTokens.Add(newRefreshToken);

        await _userRepository.UpdateAsync(user, cancellationToken);

        // Yeni access token üret
        var accessToken = _jwtTokenService.GenerateAccessToken(user);

        var response = new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken.Token,
            AccessTokenExpiresAt = _jwtTokenService.GetAccessTokenExpiry(),
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            }
        };

        return Result.Success(response, "Token başarıyla yenilendi.");
    }
}
