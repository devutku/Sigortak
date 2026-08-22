using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using Sigortak.EventBus.Abstractions;

namespace Sigortak.EventBus.RabbitMq;

/// <summary>
/// RabbitMQ tabanlı event bus — command queue'ları ve DLQ desteği ile.
/// </summary>
public class RabbitMqEventBus : IEventBus, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMqEventBus> _logger;
    private readonly string _exchangeName;

    public RabbitMqEventBus(
        RabbitMqSettings settings,
        ILogger<RabbitMqEventBus> logger)
    {
        _logger = logger;
        _exchangeName = settings.ExchangeName;

        var factory = new ConnectionFactory
        {
            HostName = settings.HostName,
            Port = settings.Port,
            UserName = settings.UserName,
            Password = settings.Password,
            VirtualHost = settings.VirtualHost,
            DispatchConsumersAsync = true
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        // Ana exchange
        _channel.ExchangeDeclare(
            exchange: _exchangeName,
            type: ExchangeType.Topic,
            durable: true);

        // Dead Letter Exchange (DLQ)
        _channel.ExchangeDeclare(
            exchange: $"{_exchangeName}.dlx",
            type: ExchangeType.Topic,
            durable: true);

        _logger.LogInformation("RabbitMQ bağlantısı kuruldu: {Host}:{Port}/{VHost}",
            settings.HostName, settings.Port, settings.VirtualHost);
    }

    public virtual Task PublishAsync<T>(T @event, CancellationToken cancellationToken = default)
        where T : IntegrationEvent
    {
        var routingKey = @event.EventTypeName;
        var message = JsonSerializer.Serialize(@event, @event.GetType());
        var body = Encoding.UTF8.GetBytes(message);

        var properties = _channel.CreateBasicProperties();
        properties.Persistent = true;
        properties.MessageId = @event.Id.ToString();
        properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());
        properties.ContentType = "application/json";

        _channel.BasicPublish(
            exchange: _exchangeName,
            routingKey: routingKey,
            basicProperties: properties,
            body: body);

        _logger.LogInformation("RabbitMQ event yayınlandı: {EventType} (ID: {EventId})",
            routingKey, @event.Id);

        return Task.CompletedTask;
    }

    public void Subscribe<T, THandler>()
        where T : IntegrationEvent
        where THandler : IIntegrationEventHandler<T>
    {
        var eventName = typeof(T).Name;
        var queueName = $"sigortak.{eventName.ToLowerInvariant()}.queue";

        // DLQ kuyruğu
        var dlqQueueName = $"{queueName}.dlq";
        _channel.QueueDeclare(
            queue: dlqQueueName,
            durable: true,
            exclusive: false,
            autoDelete: false);
        _channel.QueueBind(dlqQueueName, $"{_exchangeName}.dlx", eventName);

        // Ana kuyruk — DLQ yönlendirmesiyle
        var args = new Dictionary<string, object>
        {
            { "x-dead-letter-exchange", $"{_exchangeName}.dlx" },
            { "x-dead-letter-routing-key", eventName },
            { "x-message-ttl", 30000 } // 30 saniye retry sonrası DLQ'ya gönder
        };

        _channel.QueueDeclare(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: args);

        _channel.QueueBind(queueName, _exchangeName, eventName);

        _logger.LogInformation("RabbitMQ kuyruğu oluşturuldu: {Queue} (DLQ: {DlqQueue})",
            queueName, dlqQueueName);
    }

    public void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
    }
}

/// <summary>
/// RabbitMQ bağlantı ayarları.
/// </summary>
public class RabbitMqSettings
{
    public string HostName { get; set; } = "localhost";
    public int Port { get; set; } = 5672;
    public string UserName { get; set; } = "guest";
    public string Password { get; set; } = "guest";
    public string VirtualHost { get; set; } = "/";
    public string ExchangeName { get; set; } = "sigortak.exchange";
}
