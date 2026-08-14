using Sigortak.Common.Exceptions;
using Sigortak.Common.Models;
using Sigortak.CQRS.Commands;
using Sigortak.Identity.Application.DTOs;
using Sigortak.Identity.Application.Interfaces;
using Sigortak.Identity.Domain.Entities;

namespace Sigortak.Identity.Application.Commands.Register;

/// <summary>
/// RegisterCommand handler — kullanıcı oluşturur, JWT token üretir.
/// </summary>
public class RegisterCommandHandler : ICommandHandler<RegisterCommand, Result<AuthResponseDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı adı kontrolü
        if (await _userRepository.ExistsByUsernameAsync(request.Username, cancellationToken))
            throw new BusinessException("Bu kullanıcı adı zaten kullanılmaktadır.");

        // E-posta kontrolü
        if (await _userRepository.ExistsByEmailAsync(request.Email, cancellationToken))
            throw new BusinessException("Bu e-posta adresi zaten kayıtlıdır.");

        // Kullanıcı oluştur
        var user = new User
        {
            Username = request.Username,
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Role = request.Role,
            TenantId = request.TenantId ?? Guid.NewGuid(),
            IsActive = true
        };

        // Refresh token oluştur
        var refreshToken = _jwtTokenService.GenerateRefreshToken("system");
        refreshToken.UserId = user.Id;
        user.RefreshTokens.Add(refreshToken);

        // Kaydet
        await _userRepository.CreateAsync(user, cancellationToken);

        // JWT token üret
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
                CreatedAt = user.CreatedAt
            }
        };

        return Result.Success(response, "Kullanıcı başarıyla oluşturuldu.");
    }
}
