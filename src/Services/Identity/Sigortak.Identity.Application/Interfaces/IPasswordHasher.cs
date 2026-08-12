namespace Sigortak.Identity.Application.Interfaces;

/// <summary>
/// Password hasher arayüzü — BCrypt tabanlı şifre hash/doğrulama.
/// </summary>
public interface IPasswordHasher
{
    /// <summary>Düz metin şifreyi hashler.</summary>
    string Hash(string password);

    /// <summary>Düz metin şifreyi hash ile doğrular.</summary>
    bool Verify(string password, string hash);
}
