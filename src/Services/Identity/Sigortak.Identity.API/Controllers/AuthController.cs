using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sigortak.Identity.Application.Commands.Login;
using Sigortak.Identity.Application.Commands.Register;
using Sigortak.Identity.Application.Commands.RefreshToken;

namespace Sigortak.Identity.API.Controllers;

/// <summary>
/// Kimlik doğrulama controller'ı — Register, Login, RefreshToken.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Yeni kullanıcı kaydı oluşturur.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(Register), result);
    }

    /// <summary>
    /// Kullanıcı girişi — JWT access token ve refresh token döndürür.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        // IP adresini request'ten al
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var commandWithIp = command with { IpAddress = ipAddress };

        var result = await _mediator.Send(commandWithIp);
        return Ok(result);
    }

    /// <summary>
    /// Refresh token ile yeni access token alır (Token Rotation).
    /// </summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var commandWithIp = command with { IpAddress = ipAddress };

        var result = await _mediator.Send(commandWithIp);
        return Ok(result);
    }
}
