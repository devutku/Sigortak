namespace Sigortak.EventBus.Abstractions;

/// <summary>
/// Event bus abstraction — RabbitMQ (command) ve Kafka (domain event) publish/subscribe.
/// </summary>
public interface IEventBus
{
    /// <summary>
    /// Bir integration event'i yayınlar.
    /// </summary>
    Task PublishAsync<T>(T @event, CancellationToken cancellationToken = default)
        where T : IntegrationEvent;

    /// <summary>
    /// Belirli bir event tipini dinlemeye başlar.
    /// </summary>
    void Subscribe<T, THandler>()
        where T : IntegrationEvent
        where THandler : IIntegrationEventHandler<T>;
}

/// <summary>
/// Integration event handler — gelen event'leri işler.
/// </summary>
public interface IIntegrationEventHandler<in T> where T : IntegrationEvent
{
    Task HandleAsync(T @event, CancellationToken cancellationToken = default);
}

/// <summary>
/// Integration event base class — servisler arası olay paylaşımı.
/// </summary>
public class IntegrationEvent
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTime CreatedAt { get; } = DateTime.UtcNow;
    public string EventTypeName => GetType().Name;
    public Guid TenantId { get; set; }
}
