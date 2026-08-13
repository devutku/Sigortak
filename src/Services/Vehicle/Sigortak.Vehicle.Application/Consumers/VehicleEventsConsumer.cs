using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Sigortak.EventBus.Kafka;
using Sigortak.Vehicle.Application.Events;
using Sigortak.Vehicle.Application.DTOs;
using Sigortak.Vehicle.Domain.Entities;
using Sigortak.Vehicle.Domain.Interfaces;

namespace Sigortak.Vehicle.Application.Consumers;

/// <summary>
/// Kafka'dan vehicle-events dinleyip Read DB (postgres-read) ve Redis'i güncelleyen sync consumer.
/// </summary>
public class VehicleEventsConsumer : BackgroundService
{
    private readonly ILogger<VehicleEventsConsumer> _logger;
    private readonly IConnectionMultiplexer _redisConnection;
    private readonly IServiceProvider _serviceProvider;
    private readonly KafkaSettings _settings;
    private readonly IConsumer<string, string> _consumer;
    private const string CacheKeyAll = "vehicles:all";

    public VehicleEventsConsumer(
        ILogger<VehicleEventsConsumer> logger,
        IConnectionMultiplexer redisConnection,
        IServiceProvider serviceProvider,
        KafkaSettings settings)
    {
        _logger = logger;
        _redisConnection = redisConnection;
        _serviceProvider = serviceProvider;
        _settings = settings;

        var config = new ConsumerConfig
        {
            BootstrapServers = settings.BootstrapServers,
            GroupId = settings.GroupId + "-read-sync",
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
        _logger.LogInformation("Kafka Event Consumer 'vehicle-events' dinlemeye başladı (Read DB sync).");

        Task.Run(async () =>
        {
            var redisDb = _redisConnection.GetDatabase();

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

                    _logger.LogInformation("Kafka'dan sync event'i alındı. EventType: {EventType}, Key: {Key}", eventType, consumeResult.Message.Key);

                    using var scope = _serviceProvider.CreateScope();
                    var readRepository = scope.ServiceProvider.GetRequiredService<IVehiclePolicyReadRepository>();

                    if (eventType == nameof(VehicleCreatedEvent) || string.IsNullOrEmpty(eventType))
                    {
                        var vehicleEvent = JsonSerializer.Deserialize<VehicleCreatedEvent>(consumeResult.Message.Value);
                        if (vehicleEvent != null)
                        {
                            // 1. Write to Read DB (postgres-read)
                            var existing = await readRepository.GetByVehicleIdAsync(vehicleEvent.VehicleId, stoppingToken);
                            if (existing == null)
                            {
                                var view = new VehiclePolicyView
                                {
                                    VehicleId = vehicleEvent.VehicleId,
                                    Plate = vehicleEvent.Plate.ToUpperInvariant(),
                                    Brand = vehicleEvent.Brand,
                                    Model = vehicleEvent.Model,
                                    Year = vehicleEvent.Year,
                                    BodyType = vehicleEvent.BodyType.ToString(),
                                    OwnerId = vehicleEvent.OwnerId,
                                    InspectionDate = vehicleEvent.InspectionDate,
                                    UpdatedAt = DateTime.UtcNow
                                };
                                await readRepository.CreateAsync(view, stoppingToken);
                                _logger.LogInformation("Read DB'ye yeni araç kaydedildi: {Plate}", vehicleEvent.Plate);
                            }

                            // 2. Write single vehicle info to Redis cache
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
                                InspectionDate = vehicleEvent.InspectionDate,
                                InsuranceEndDate = vehicleEvent.InsuranceEndDate,
                                IsActive = true,
                                CreatedAt = vehicleEvent.CreatedAt
                            };

                            await redisDb.StringSetAsync(cacheKey, JsonSerializer.Serialize(dto), TimeSpan.FromMinutes(15));
                            await redisDb.KeyDeleteAsync(CacheKeyAll);
                        }
                    }
                    else if (eventType == nameof(PolicyCreatedEvent))
                    {
                        var policyEvent = JsonSerializer.Deserialize<PolicyCreatedEvent>(consumeResult.Message.Value);
                        if (policyEvent != null)
                        {
                            // Update Read DB
                            var view = await readRepository.GetByVehicleIdAsync(policyEvent.VehicleId, stoppingToken);
                            if (view != null)
                            {
                                view.PolicyId = policyEvent.PolicyId;
                                view.PolicyNumber = policyEvent.PolicyNumber;
                                view.StartDate = policyEvent.StartDate;
                                view.EndDate = policyEvent.EndDate;
                                view.Premium = policyEvent.Premium;
                                view.DocumentUrl = policyEvent.DocumentUrl;
                                view.PolicyIsActive = true;
                                view.UpdatedAt = DateTime.UtcNow;

                                await readRepository.UpdateAsync(view, stoppingToken);
                                _logger.LogInformation("Read DB araç poliçesi güncellendi: VehicleId: {VehicleId}, PolicyId: {PolicyId}", view.VehicleId, view.PolicyId);
                            }

                            // Clear cache
                            await redisDb.KeyDeleteAsync(CacheKeyAll);
                            var plateKey = view != null ? $"vehicle:plate:{view.Plate.ToUpperInvariant()}" : null;
                            if (plateKey != null) await redisDb.KeyDeleteAsync(plateKey);
                        }
                    }
                    else if (eventType == nameof(PolicyRenewedEvent))
                    {
                        var policyEvent = JsonSerializer.Deserialize<PolicyRenewedEvent>(consumeResult.Message.Value);
                        if (policyEvent != null)
                        {
                            // Update Read DB
                            var view = await readRepository.GetByVehicleIdAsync(policyEvent.VehicleId, stoppingToken);
                            if (view != null)
                            {
                                view.PolicyId = policyEvent.PolicyId;
                                view.PolicyNumber = policyEvent.PolicyNumber;
                                view.StartDate = policyEvent.StartDate;
                                view.EndDate = policyEvent.EndDate;
                                view.Premium = policyEvent.Premium;
                                view.DocumentUrl = policyEvent.DocumentUrl;
                                view.PolicyIsActive = true;
                                view.UpdatedAt = DateTime.UtcNow;

                                await readRepository.UpdateAsync(view, stoppingToken);
                                _logger.LogInformation("Read DB araç poliçesi yenilendi: VehicleId: {VehicleId}, PolicyId: {PolicyId}", view.VehicleId, view.PolicyId);
                            }

                            // Clear cache
                            await redisDb.KeyDeleteAsync(CacheKeyAll);
                            var plateKey = view != null ? $"vehicle:plate:{view.Plate.ToUpperInvariant()}" : null;
                            if (plateKey != null) await redisDb.KeyDeleteAsync(plateKey);
                        }
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
}
