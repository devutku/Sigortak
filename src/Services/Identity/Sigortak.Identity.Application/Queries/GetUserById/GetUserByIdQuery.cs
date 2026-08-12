using Sigortak.Common.Models;
using Sigortak.CQRS.Queries;
using Sigortak.Identity.Application.DTOs;

namespace Sigortak.Identity.Application.Queries.GetUserById;

/// <summary>
/// Kullanıcı detay sorgusu — ID ile kullanıcı bilgisi getirir.
/// </summary>
public record GetUserByIdQuery(Guid Id) : IQuery<Result<UserDto>>;
