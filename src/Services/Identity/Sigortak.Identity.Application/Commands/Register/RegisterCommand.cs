using Sigortak.Common.Models;
using Sigortak.CQRS.Commands;
using Sigortak.Identity.Application.DTOs;
using Sigortak.Identity.Domain.Enums;

namespace Sigortak.Identity.Application.Commands.Register;

/// <summary>
/// Kullanıcı kayıt komutu — yeni hesap oluşturur.
/// </summary>
public record RegisterCommand(
    string Username,
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    Role Role = Role.IndividualUser,
    Guid? TenantId = null
) : ICommand<Result<AuthResponseDto>>;
