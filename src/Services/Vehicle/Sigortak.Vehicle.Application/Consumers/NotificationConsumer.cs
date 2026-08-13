using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Sigortak.EventBus.Kafka;
using Sigortak.Vehicle.Application.Events;
using Sigortak.Vehicle.Application.Interfaces;

namespace Sigortak.Vehicle.Application.Consumers;

/// <summary>
/// Kafka'dan PolicyExpirationWarningEvent dinleyip SMS ve Push notification tetikleyen servis.
/// </summary>
public class NotificationConsumer : BackgroundService
{
    private readonly ILogger<NotificationConsumer> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly KafkaSettings _settings;
    private readonly IConsumer<string, string> _consumer;

    public NotificationConsumer(
        ILogger<NotificationConsumer> logger,
        IServiceProvider serviceProvider,
        KafkaSettings settings)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _settings = settings;

        var config = new ConsumerConfig
        {
            BootstrapServers = settings.BootstrapServers,
            GroupId = settings.GroupId + "-notification-sync",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = true
        };

        _consumer = new ConsumerBuilder<string, string>(config)
            .SetErrorHandler((_, error) => _logger.LogError("Kafka Notification Consumer Hatası: {Reason}", error.Reason))
            .Build();
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _consumer.Subscribe("vehicle-events");
        _logger.LogInformation("Kafka Notification Consumer 'vehicle-events' dinlemeye başladı.");

        Task.Run(async () =>
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var consumeResult = _consumer.Consume(stoppingToken);
                    if (consumeResult == null) continue;

                    string eventType = string.Empty;
                    if (consumeResult.Message.Headers.TryGetLastBytes("event-type", out var headerBytes))
                    {
                        eventType = Encoding.UTF8.GetString(headerBytes);
                    }

                    if (eventType == nameof(PolicyExpirationWarningEvent))
                    {
                        var warningEvent = JsonSerializer.Deserialize<PolicyExpirationWarningEvent>(consumeResult.Message.Value);
                        if (warningEvent != null)
                        {
                            _logger.LogInformation("Notification Consumer: PolicyExpirationWarningEvent alındı: Poliçe No: {PolicyNumber}", warningEvent.PolicyNumber);

                            using var scope = _serviceProvider.CreateScope();
                            var smsService = scope.ServiceProvider.GetRequiredService<ISmsService>();
                            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                            var smsMsg = $"Sayın Müşterimiz, {warningEvent.PolicyNumber} numaralı araç sigorta poliçenizin bitmesine {warningEvent.RemainingDays} gün kalmıştır. Yenileme işlemleri için acentenizle iletişime geçebilirsiniz.";
                            var pushTitle = "Poliçe Süre Sonu Yaklaşıyor!";
                            var pushBody = $"{warningEvent.PolicyNumber} numaralı poliçenizin süresi {warningEvent.RemainingDays} gün sonra doluyor.";

                            await smsService.SendSmsAsync(warningEvent.CustomerPhone, smsMsg, stoppingToken);
                            await notificationService.SendPushNotificationAsync(warningEvent.CustomerEmail, pushTitle, pushBody, null, stoppingToken);
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Kafka notification event işleme hatası.");
                }
            }
        }, stoppingToken);

        return Task.CompletedTask;
    }
}
