using Sigortak.Identity.Application.Interfaces;

namespace Sigortak.Identity.Infrastructure.Services;

/// <summary>
/// BCrypt tabanlı şifre hash servisi.
/// </summary>
public class PasswordHasherService : IPasswordHasher
{
    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(11));
    }

    public bool Verify(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
