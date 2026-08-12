namespace Sigortak.Common.Models;

/// <summary>
/// Standart API response wrapper — başarı/hata durumlarını tutarlı formatta döndürür.
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public string Message { get; }
    public List<string> Errors { get; }

    protected Result(bool isSuccess, string message, List<string>? errors = null)
    {
        IsSuccess = isSuccess;
        Message = message;
        Errors = errors ?? new List<string>();
    }

    public static Result Success(string message = "İşlem başarılı.")
        => new(true, message);

    public static Result Failure(string message, List<string>? errors = null)
        => new(false, message, errors);

    public static Result<T> Success<T>(T data, string message = "İşlem başarılı.")
        => new(data, true, message);

    public static Result<T> Failure<T>(string message, List<string>? errors = null)
        => new(default, false, message, errors);
}

/// <summary>
/// Generic result wrapper — veri taşıyan response'lar için.
/// </summary>
public class Result<T> : Result
{
    public T? Data { get; }

    internal Result(T? data, bool isSuccess, string message, List<string>? errors = null)
        : base(isSuccess, message, errors)
    {
        Data = data;
    }
}
