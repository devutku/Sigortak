using FluentValidation;

namespace Sigortak.Identity.Application.Commands.Login;

/// <summary>
/// LoginCommand doğrulayıcısı — zorunlu alan kontrolü.
/// </summary>
public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Kullanıcı adı zorunludur.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre zorunludur.");
    }
}
