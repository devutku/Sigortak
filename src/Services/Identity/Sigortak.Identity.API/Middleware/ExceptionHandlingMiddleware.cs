using System.Text.Json;
using Sigortak.Common.Exceptions;
using Sigortak.Common.Models;

namespace Sigortak.Identity.API.Middleware;

/// <summary>
/// Global exception handling middleware — tüm hataları tutarlı JSON formatında döndürür.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, result) = exception switch
        {
            ValidationException validationEx => (
                StatusCodes.Status422UnprocessableEntity,
                new
                {
                    IsSuccess = false,
                    Message = validationEx.Message,
                    Errors = validationEx.Errors
                } as object
            ),

            BusinessException businessEx => (
                StatusCodes.Status400BadRequest,
                Result.Failure(businessEx.Message, businessEx.Errors) as object
            ),

            NotFoundException notFoundEx => (
                StatusCodes.Status404NotFound,
                Result.Failure(notFoundEx.Message) as object
            ),

            ForbiddenException forbiddenEx => (
                StatusCodes.Status403Forbidden,
                Result.Failure(forbiddenEx.Message) as object
            ),

            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                Result.Failure("Yetkisiz erişim.") as object
            ),

            _ => (
                StatusCodes.Status500InternalServerError,
                Result.Failure("Beklenmeyen bir hata oluştu.") as object
            )
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "İşlenmeyen hata: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning("İş hatası ({StatusCode}): {Message}", statusCode, exception.Message);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(result, options));
    }
}
