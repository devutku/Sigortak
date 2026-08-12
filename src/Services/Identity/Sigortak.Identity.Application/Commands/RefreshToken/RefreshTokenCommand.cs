using Sigortak.Common.Models;
using Sigortak.CQRS.Commands;
using Sigortak.Identity.Application.DTOs;

namespace Sigortak.Identity.Application.Commands.RefreshToken;

/// <summary>
/// Token yenileme komutu — mevcut refresh token ile yeni access + refresh token çifti alır.
/// </summary>
public record RefreshTokenCommand(
    string Token,
    string IpAddress = "unknown"
) : ICommand<Result<AuthResponseDto>>;
