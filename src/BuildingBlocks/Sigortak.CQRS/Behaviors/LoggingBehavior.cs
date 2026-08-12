using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Sigortak.CQRS.Behaviors;

/// <summary>
/// MediatR pipeline behavior — tüm request/response'ları loglar ve yavaş sorguları tespit eder.
/// </summary>
public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        _logger.LogInformation("[START] {RequestName}", requestName);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();
            stopwatch.Stop();

            if (stopwatch.ElapsedMilliseconds > 500)
            {
                _logger.LogWarning("[SLOW] {RequestName} tamamlandı ({ElapsedMs}ms) — performans incelenmeli.",
                    requestName, stopwatch.ElapsedMilliseconds);
            }
            else
            {
                _logger.LogInformation("[END] {RequestName} tamamlandı ({ElapsedMs}ms)",
                    requestName, stopwatch.ElapsedMilliseconds);
            }

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "[ERROR] {RequestName} başarısız oldu ({ElapsedMs}ms)",
                requestName, stopwatch.ElapsedMilliseconds);
            throw;
        }
    }
}
