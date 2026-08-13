using Microsoft.Extensions.Logging;
using Sigortak.Vehicle.Application.Interfaces;

namespace Sigortak.Vehicle.Infrastructure.Notifications;

public class MockFcmService : INotificationService
{
    private readonly ILogger<MockFcmService> _logger;

    public MockFcmService(ILogger<MockFcmService> logger)
    {
        _logger = logger;
    }

    public Task SendPushNotificationAsync(string targetTokenOrTopic, string title, string body, Dictionary<string, string>? data = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("==================================================");
        _logger.LogInformation("🔔 [MOCK FCM SENDER] - YENİ PUSH BİLDİRİMİ GÖNDERİLDİ");
        _logger.LogInformation("Hedef: {Target}", targetTokenOrTopic);
        _logger.LogInformation("Başlık: {Title}", title);
        _logger.LogInformation("İçerik: {Body}", body);
        if (data != null)
        {
            _logger.LogInformation("Data: {Data}", string.Join(", ", data.Select(x => $"{x.Key}={x.Value}")));
        }
        _logger.LogInformation("Entegrasyon Durumu: MOCK (Firebase Cloud Messaging mock)");
        _logger.LogInformation("==================================================");
        return Task.CompletedTask;
    }
}
