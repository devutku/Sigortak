using Sigortak.Common.Exceptions;
using Sigortak.Common.Models;
using Sigortak.CQRS.Queries;
using Sigortak.Identity.Application.DTOs;
using Sigortak.Identity.Application.Interfaces;

namespace Sigortak.Identity.Application.Queries.GetUserById;

/// <summary>
/// GetUserByIdQuery handler — kullanıcı bilgisini getirir.
/// </summary>
public class GetUserByIdQueryHandler : IQueryHandler<GetUserByIdQuery, Result<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<UserDto>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user == null)
            throw new NotFoundException("User", request.Id);

        var dto = new UserDto
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
        };

        return Result.Success(dto);
    }
}
