using Sigortak.Common.Exceptions;
using Sigortak.Common.Models;
using Sigortak.CQRS.Commands;
using Sigortak.Identity.Application.DTOs;
using Sigortak.Identity.Application.Interfaces;

namespace Sigortak.Identity.Application.Commands.Login;

/// <summary>
/// LoginCommand handler — şifre doğrulama, JWT üretimi, refresh token oluşturma.
/// </summary>
public class LoginCommandHandler : ICommandHandler<LoginCommand, Result<AuthResponseDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcıyı bul
        var user = await _userRepository.GetByUsernameAsync(request.Username, cancellationToken);
        if (user == null)
            throw new BusinessException("Kullanıcı adı veya şifre hatalı.");

        // Hesap aktiflik kontrolü
        if (!user.IsActive)
            throw new BusinessException("Hesabınız devre dışı bırakılmıştır. Lütfen yönetici ile iletişime geçiniz.");

        // Şifre doğrulama
        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new BusinessException("Kullanıcı adı veya şifre hatalı.");

        // Eski refresh token'ları devre dışı bırak
        foreach (var existingToken in user.RefreshTokens.Where(t => t.IsActive))
        {
            existingToken.RevokedAt = DateTime.UtcNow;
            existingToken.RevokedByIp = request.IpAddress;
            existingToken.ReasonRevoked = "Yeni giriş yapıldı";
        }

        // Yeni refresh token oluştur
        var refreshToken = _jwtTokenService.GenerateRefreshToken(request.IpAddress);
        refreshToken.UserId = user.Id;
        user.RefreshTokens.Add(refreshToken);

        // Son giriş tarihini güncelle
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        // JWT access token üret
        var accessToken = _jwtTokenService.GenerateAccessToken(user);

        var response = new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
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

        return Result.Success(response, "Giriş başarılı.");
    }
}
