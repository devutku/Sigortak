using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Sigortak.EventBus.Kafka;
using Sigortak.Vehicle.Application.Events;
using Sigortak.Vehicle.Application.DTOs;

namespace Sigortak.Vehicle.Application.Consumers;

/// <summary>
/// Kafka'dan vehicle-events dinleyip Redis'i güncelleyen sync consumer.
/// </summary>
public class VehicleEventsConsumer : BackgroundService
{
    private readonly ILogger<VehicleEventsConsumer> _logger;
    private readonly IConnectionMultiplexer _redisConnection;
    private readonly KafkaSettings _settings;
    private readonly IConsumer<string, string> _consumer;
    private const string CacheKeyAll = "vehicles:all";

    public VehicleEventsConsumer(
        ILogger<VehicleEventsConsumer> logger,
        IConnectionMultiplexer redisConnection,
        KafkaSettings settings)
    {
        _logger = logger;
        _redisConnection = redisConnection;
        _settings = settings;

        var config = new ConsumerConfig
        {
            BootstrapServers = settings.BootstrapServers,
            GroupId = settings.GroupId + "-vehicle-sync",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = true
        };

        _consumer = new ConsumerBuilder<string, string>(config)
            .SetErrorHandler((_, error) => _logger.LogError("Kafka Consumer Hatası: {Reason}", error.Reason))
            .Build();
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _consumer.Subscribe("vehicle-events");
        _logger.LogInformation("Kafka Event Consumer 'vehicle-events' dinlemeye başladı.");

        Task.Run(async () =>
        {
            var db = _redisConnection.GetDatabase();

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var consumeResult = _consumer.Consume(stoppingToken);
                    if (consumeResult == null) continue;

                    _logger.LogInformation("Kafka'dan sync event'i alındı: {Key}", consumeResult.Message.Key);
                    var vehicleEvent = JsonSerializer.Deserialize<VehicleCreatedEvent>(consumeResult.Message.Value);

                    if (vehicleEvent != null)
                    {
                        // 1. Tekil plaka bilgisini Redis'e yaz
                        var cacheKey = $"vehicle:plate:{vehicleEvent.Plate.ToUpperInvariant()}";
                        var dto = new VehicleDto
                        {
                            Id = vehicleEvent.VehicleId,
                            Plate = vehicleEvent.Plate,
                            Brand = vehicleEvent.Brand,
                            Model = vehicleEvent.Model,
                            Year = vehicleEvent.Year,
                            OwnerId = vehicleEvent.OwnerId,
                            BodyType = vehicleEvent.BodyType.ToString(),
                            IsActive = true,
                            CreatedAt = vehicleEvent.CreatedAt
                        };

                        await db.StringSetAsync(cacheKey, JsonSerializer.Serialize(dto), TimeSpan.FromMinutes(15));
                        _logger.LogInformation("Redis tekil araç güncellendi: {Plate}", vehicleEvent.Plate);

                        // 2. Genel araç listesi önbelleğini temizle (bir sonraki sorguda güncel çekilmesi için)
                        await db.KeyDeleteAsync(CacheKeyAll);
                        _logger.LogInformation("Redis toplu araç cache'i temizlendi (vehicles:all).");
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Kafka event işleme hatası.");
                }
            }
        }, stoppingToken);

        return Task.CompletedTask;
    }

    public override void Dispose()
    {
        _consumer.Close();
        _consumer.Dispose();
        base.Dispose();
    }
}
