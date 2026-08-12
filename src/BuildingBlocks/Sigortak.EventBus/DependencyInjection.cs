using Microsoft.Extensions.DependencyInjection;
using Sigortak.EventBus.Abstractions;
using Sigortak.EventBus.Kafka;
using Sigortak.EventBus.RabbitMq;

namespace Sigortak.EventBus;

/// <summary>
/// EventBus servis kayıt uzantıları.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// RabbitMQ event bus'ı DI container'a kaydeder.
    /// </summary>
    public static IServiceCollection AddRabbitMqEventBus(
        this IServiceCollection services,
        Action<RabbitMqSettings> configure)
    {
        var settings = new RabbitMqSettings();
        configure(settings);

        services.AddSingleton(settings);
        services.AddSingleton<RabbitMqEventBus>();

        return services;
    }

    /// <summary>
    /// Kafka event bus'ı DI container'a kaydeder.
    /// </summary>
    public static IServiceCollection AddKafkaEventBus(
        this IServiceCollection services,
        Action<KafkaSettings> configure)
    {
        var settings = new KafkaSettings();
        configure(settings);

        services.AddSingleton(settings);
        services.AddSingleton<KafkaEventBus>();

        return services;
    }
}
