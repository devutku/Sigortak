using FluentValidation;

namespace Sigortak.Identity.Application.Commands.Register;

/// <summary>
/// RegisterCommand doğrulayıcısı — e-posta formatı, şifre gücü, zorunlu alanlar.
/// </summary>
public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Kullanıcı adı zorunludur.")
            .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Kullanıcı adı en fazla 50 karakter olabilir.")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta adresi zorunludur.")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
            .MaximumLength(255).WithMessage("E-posta adresi en fazla 255 karakter olabilir.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre zorunludur.")
            .MinimumLength(8).WithMessage("Şifre en az 8 karakter olmalıdır.")
            .MaximumLength(128).WithMessage("Şifre en fazla 128 karakter olabilir.")
            .Matches(@"[A-Z]").WithMessage("Şifre en az bir büyük harf içermelidir.")
            .Matches(@"[a-z]").WithMessage("Şifre en az bir küçük harf içermelidir.")
            .Matches(@"[0-9]").WithMessage("Şifre en az bir rakam içermelidir.")
            .Matches(@"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]").WithMessage("Şifre en az bir özel karakter içermelidir.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Ad zorunludur.")
            .MaximumLength(100).WithMessage("Ad en fazla 100 karakter olabilir.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Soyad zorunludur.")
            .MaximumLength(100).WithMessage("Soyad en fazla 100 karakter olabilir.");

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[0-9]{10,15}$")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Geçerli bir telefon numarası giriniz (ör: +905551234567).");
    }
}
