using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Sigortak.EventBus.Kafka;
using Sigortak.Policy.Application.Events;
using Sigortak.Policy.Infrastructure.Persistence;

namespace Sigortak.Policy.Infrastructure.BackgroundServices;

public class PolicyExpirationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PolicyExpirationWorker> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(24);

    public PolicyExpirationWorker(IServiceProvider serviceProvider, ILogger<PolicyExpirationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PolicyExpirationWorker dinlemeye başladı (Zamanlayıcı).");

        await Task.Delay(10000, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckExpiringPoliciesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Poliçe süre takibi kontrolünde hata oluştu.");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    public async Task CheckExpiringPoliciesAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Poliçe süre sonu kontrolleri başlatılıyor...");
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PolicyDbContext>();
        var eventBus = scope.ServiceProvider.GetRequiredService<KafkaEventBus>();

        var today = DateTime.UtcNow.Date;
        var activePolicies = await dbContext.Policies
            .Where(p => p.IsActive)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Sistemdeki toplam {Count} aktif poliçe kontrol ediliyor.", activePolicies.Count);

        foreach (var policy in activePolicies)
        {
            var remainingDays = (int)(policy.EndDate.Date - today).TotalDays;

            _logger.LogDebug("Poliçe: {PolicyNumber}, Kalan Gün: {Days}", policy.PolicyNumber, remainingDays);

            if (remainingDays == 30 || remainingDays == 15 || remainingDays == 7)
            {
                _logger.LogWarning("Yaklaşan poliçe bitiş uyarısı! Poliçe No: {PolicyNumber}, Kalan Gün: {Days}", policy.PolicyNumber, remainingDays);

                var customerPhone = "+905551234567";
                var customerEmail = "musteri@sigortak.dev";

                var warningEvent = new PolicyExpirationWarningEvent(
                    policy.Id,
                    policy.PolicyNumber,
                    policy.VehicleId,
                    remainingDays,
                    customerPhone,
                    customerEmail
                );
                warningEvent.TenantId = policy.TenantId;

                await eventBus.PublishAsync(warningEvent, cancellationToken);
            }
        }
        _logger.LogInformation("Poliçe kontrolleri tamamlandı.");
    }
}
