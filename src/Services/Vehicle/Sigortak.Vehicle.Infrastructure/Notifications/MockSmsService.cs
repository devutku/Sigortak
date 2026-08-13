using Microsoft.Extensions.Logging;
using Sigortak.Vehicle.Application.Interfaces;

namespace Sigortak.Vehicle.Infrastructure.Notifications;

public class MockSmsService : ISmsService
{
    private readonly ILogger<MockSmsService> _logger;

    public MockSmsService(ILogger<MockSmsService> logger)
    {
        _logger = logger;
    }

    public Task SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("==================================================");
        _logger.LogInformation("📲 [MOCK SMS SENDER] - YENİ SMS GÖNDERİLDİ");
        _logger.LogInformation("Alıcı: {Phone}", phoneNumber);
        _logger.LogInformation("Mesaj: {Msg}", message);
        _logger.LogInformation("Tarih: {Date}", DateTime.UtcNow);
        _logger.LogInformation("Entegrasyon Durumu: MOCK (Twilio/Netgsm credentials mock)");
        _logger.LogInformation("==================================================");
        return Task.CompletedTask;
    }
}
