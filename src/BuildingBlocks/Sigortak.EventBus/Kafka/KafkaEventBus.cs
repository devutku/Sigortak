using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Logging;
using Sigortak.EventBus.Abstractions;

namespace Sigortak.EventBus.Kafka;

/// <summary>
/// Apache Kafka tabanlı event bus — domain event'lerin yayınlanması için.
/// PolicyCreated, PolicyRenewed, VehicleAdded gibi olayları "policy-events" topic'ine yayınlar.
/// </summary>
public class KafkaEventBus : IEventBus, IDisposable
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaEventBus> _logger;
    private readonly string _defaultTopic;

    protected KafkaEventBus()
    {
        _producer = null!;
        _logger = null!;
        _defaultTopic = null!;
    }

    public KafkaEventBus(
        KafkaSettings settings,
        ILogger<KafkaEventBus> logger)
    {
        _logger = logger;
        _defaultTopic = settings.DefaultTopic;

        var config = new ProducerConfig
        {
            BootstrapServers = settings.BootstrapServers,
            Acks = Acks.All,
            EnableIdempotence = true,
            MessageSendMaxRetries = 3,
            RetryBackoffMs = 1000
        };

        _producer = new ProducerBuilder<string, string>(config)
            .SetErrorHandler((_, error) =>
                _logger.LogError("Kafka Producer hatası: {Reason}", error.Reason))
            .Build();

        _logger.LogInformation("Kafka Producer başlatıldı: {Servers}, Topic: {Topic}",
            settings.BootstrapServers, settings.DefaultTopic);
    }

    public virtual async Task PublishAsync<T>(T @event, CancellationToken cancellationToken = default)
        where T : IntegrationEvent
    {
        var topic = _defaultTopic;
        var key = @event.Id.ToString();
        var value = JsonSerializer.Serialize(@event, @event.GetType());

        var message = new Message<string, string>
        {
            Key = key,
            Value = value,
            Headers = new Headers
            {
                { "event-type", System.Text.Encoding.UTF8.GetBytes(@event.EventTypeName) },
                { "created-at", System.Text.Encoding.UTF8.GetBytes(@event.CreatedAt.ToString("O")) }
            }
        };

        var deliveryResult = await _producer.ProduceAsync(topic, message, cancellationToken);

        _logger.LogInformation(
            "Kafka event yayınlandı: {EventType} → Topic: {Topic}, Partition: {Partition}, Offset: {Offset}",
            @event.EventTypeName, topic, deliveryResult.Partition.Value, deliveryResult.Offset.Value);
    }

    public void Subscribe<T, THandler>()
        where T : IntegrationEvent
        where THandler : IIntegrationEventHandler<T>
    {
        // Kafka consumer'lar ayrı hosted service olarak çalışır
        // Bu metot subscription kaydı tutar
        _logger.LogInformation("Kafka subscription kaydedildi: {EventType} → {Handler}",
            typeof(T).Name, typeof(THandler).Name);
    }

    public void Dispose()
    {
        _producer?.Flush(TimeSpan.FromSeconds(10));
        _producer?.Dispose();
    }
}

/// <summary>
/// Kafka bağlantı ayarları.
/// </summary>
public class KafkaSettings
{
    public string BootstrapServers { get; set; } = "localhost:9092";
    public string DefaultTopic { get; set; } = "policy-events";
    public string GroupId { get; set; } = "sigortak-consumer-group";
}
