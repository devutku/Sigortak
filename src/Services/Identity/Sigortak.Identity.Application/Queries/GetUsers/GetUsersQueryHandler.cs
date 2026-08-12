using Sigortak.Common.Models;
using Sigortak.CQRS.Queries;
using Sigortak.Identity.Application.DTOs;
using Sigortak.Identity.Application.Interfaces;

namespace Sigortak.Identity.Application.Queries.GetUsers;

/// <summary>
/// GetUsersQuery handler — tüm kullanıcıları listeler.
/// </summary>
public class GetUsersQueryHandler : IQueryHandler<GetUsersQuery, Result<List<UserDto>>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<List<UserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);

        var dtos = users.Select(user => new UserDto
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
        }).ToList();

        return Result.Success(dtos, $"{dtos.Count} kullanıcı listelendi.");
    }
}
