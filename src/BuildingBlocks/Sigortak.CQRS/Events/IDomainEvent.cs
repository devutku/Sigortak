using MediatR;

namespace Sigortak.CQRS.Events;

/// <summary>
/// Domain event marker interface — Kafka üzerinden yayınlanacak olaylar.
/// </summary>
public interface IDomainEvent : INotification
{
    Guid EventId { get; }
    DateTime OccurredOn { get; }
    string EventType { get; }
}

/// <summary>
/// Domain event base class — ortak alanları içerir.
/// </summary>
public abstract class DomainEvent : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
    public abstract string EventType { get; }
}
