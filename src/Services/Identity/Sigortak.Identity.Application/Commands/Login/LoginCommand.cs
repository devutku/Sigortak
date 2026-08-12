using System.Text.Json.Serialization;
using Sigortak.Common.Models;
using Sigortak.CQRS.Commands;
using Sigortak.Identity.Application.DTOs;

namespace Sigortak.Identity.Application.Commands.Login;

/// <summary>
/// Kullanıcı giriş komutu — JWT access token ve refresh token döndürür.
/// </summary>
public record LoginCommand(
    string Username,
    string Password,
    [property: JsonIgnore] string IpAddress = "unknown"
) : ICommand<Result<AuthResponseDto>>;
