using Sigortak.Common.Models;
using Sigortak.CQRS.Queries;
using Sigortak.Identity.Application.DTOs;

namespace Sigortak.Identity.Application.Queries.GetUsers;

/// <summary>
/// Kullanıcı listesi sorgusu — yalnızca SystemAdmin rolü erişebilir.
/// </summary>
public record GetUsersQuery : IQuery<Result<List<UserDto>>>;
