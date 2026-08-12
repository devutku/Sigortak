namespace Sigortak.Common.Exceptions;

/// <summary>
/// İş kuralı ihlali durumlarında fırlatılır (400 Bad Request).
/// </summary>
public class BusinessException : Exception
{
    public List<string> Errors { get; }

    public BusinessException(string message, List<string>? errors = null)
        : base(message)
    {
        Errors = errors ?? new List<string>();
    }
}

/// <summary>
/// Kayıt bulunamadığında fırlatılır (404 Not Found).
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string entityName, object key)
        : base($"'{entityName}' entity with key ({key}) bulunamadı.")
    {
    }
}

/// <summary>
/// Doğrulama hatası (422 Unprocessable Entity).
/// </summary>
public class ValidationException : Exception
{
    public Dictionary<string, string[]> Errors { get; }

    public ValidationException(Dictionary<string, string[]> errors)
        : base("Bir veya daha fazla doğrulama hatası oluştu.")
    {
        Errors = errors;
    }
}

/// <summary>
/// Yetkilendirme hatası (403 Forbidden).
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "Bu işlem için yetkiniz bulunmamaktadır.")
        : base(message)
    {
    }
}
