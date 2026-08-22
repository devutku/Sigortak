using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Polly;
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
    private static string GetCacheKeyAll(Guid tenantId) => $"vehicles:all:tenant:{tenantId}";

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

                    // Polly Retry Policy: 3 kez üstel gecikmeyle (2s, 4s, 8s) veritabanı/Redis senkronizasyonunu tekrar dener.
                    await Policy
                        .Handle<Exception>()
                        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), 
                            (exception, timeSpan, retryCount, context) =>
                            {
                                _logger.LogWarning(exception, "Kafka Event Consumer senkronizasyon hatası. {TimeSpan} sonra tekrar denenecek. (Deneme: {RetryCount}/3)", timeSpan, retryCount);
                            })
                        .ExecuteAsync(async () =>
                        {
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
                                            EngineNumber = vehicleEvent.EngineNumber,
                                            EngineCapacity = vehicleEvent.EngineCapacity,
                                            ChassisNumber = vehicleEvent.ChassisNumber,
                                            RegistrationNumber = vehicleEvent.RegistrationNumber,
                                            OwnerId = vehicleEvent.OwnerId,
                                            OwnerName = vehicleEvent.OwnerName,
                                            OwnerTcNo = vehicleEvent.OwnerTcNo,
                                            OwnerAddress = vehicleEvent.OwnerAddress,
                                            UsageType = vehicleEvent.UsageType,
                                            TrafficRegistrationDate = vehicleEvent.TrafficRegistrationDate,
                                            InspectionDate = vehicleEvent.InspectionDate,
                                            InspectionPassed = vehicleEvent.InspectionPassed,
                                            InspectionDocumentUrl = vehicleEvent.InspectionDocumentUrl,
                                            TenantId = vehicleEvent.TenantId,
                                            UpdatedAt = DateTime.UtcNow
                                        };
                                        await readRepository.CreateAsync(view, stoppingToken);
                                        _logger.LogInformation("Read DB'ye yeni araç kaydedildi: {Plate}", vehicleEvent.Plate);
                                    }
                                    else
                                    {
                                        existing.Brand = vehicleEvent.Brand;
                                        existing.Model = vehicleEvent.Model;
                                        existing.Year = vehicleEvent.Year;
                                        existing.BodyType = vehicleEvent.BodyType.ToString();
                                        existing.EngineNumber = vehicleEvent.EngineNumber;
                                        existing.EngineCapacity = vehicleEvent.EngineCapacity;
                                        existing.ChassisNumber = vehicleEvent.ChassisNumber;
                                        existing.RegistrationNumber = vehicleEvent.RegistrationNumber;
                                        existing.OwnerName = vehicleEvent.OwnerName;
                                        existing.OwnerTcNo = vehicleEvent.OwnerTcNo;
                                        existing.OwnerAddress = vehicleEvent.OwnerAddress;
                                        existing.UsageType = vehicleEvent.UsageType;
                                        existing.TrafficRegistrationDate = vehicleEvent.TrafficRegistrationDate;
                                        existing.InspectionDate = vehicleEvent.InspectionDate;
                                        existing.InspectionPassed = vehicleEvent.InspectionPassed;
                                        existing.InspectionDocumentUrl = vehicleEvent.InspectionDocumentUrl;
                                        existing.UpdatedAt = DateTime.UtcNow;

                                        await readRepository.UpdateAsync(existing, stoppingToken);
                                        _logger.LogInformation("Read DB'de mevcut araç güncellendi: {Plate}", vehicleEvent.Plate);
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
                                        EngineNumber = vehicleEvent.EngineNumber,
                                        EngineCapacity = vehicleEvent.EngineCapacity,
                                        ChassisNumber = vehicleEvent.ChassisNumber,
                                        RegistrationNumber = vehicleEvent.RegistrationNumber,
                                        OwnerId = vehicleEvent.OwnerId,
                                        OwnerName = vehicleEvent.OwnerName,
                                        OwnerTcNo = vehicleEvent.OwnerTcNo,
                                        OwnerAddress = vehicleEvent.OwnerAddress,
                                        UsageType = vehicleEvent.UsageType,
                                        TrafficRegistrationDate = vehicleEvent.TrafficRegistrationDate,
                                        BodyType = vehicleEvent.BodyType.ToString(),
                                        InspectionDate = vehicleEvent.InspectionDate,
                                        InspectionPassed = vehicleEvent.InspectionPassed,
                                        InspectionDocumentUrl = vehicleEvent.InspectionDocumentUrl,
                                        InsuranceEndDate = vehicleEvent.InsuranceEndDate,
                                        IsActive = true,
                                        CreatedAt = vehicleEvent.CreatedAt
                                    };

                                    await redisDb.StringSetAsync(cacheKey, JsonSerializer.Serialize(dto), TimeSpan.FromMinutes(15));
                                    await redisDb.KeyDeleteAsync(GetCacheKeyAll(vehicleEvent.TenantId));
                                }
                            }
                            else if (eventType == nameof(PolicyCreatedEvent))
                            {
                                var policyEvent = JsonSerializer.Deserialize<PolicyCreatedEvent>(consumeResult.Message.Value);
                                if (policyEvent != null)
                                {
                                    // 1. Update Write DB
                                    var vehicleRepo = scope.ServiceProvider.GetRequiredService<IVehicleRepository>();
                                    var vehicle = await vehicleRepo.GetByIdAsync(policyEvent.VehicleId, stoppingToken);
                                    if (vehicle != null && (vehicle.InsuranceEndDate == null || policyEvent.EndDate > vehicle.InsuranceEndDate))
                                    {
                                        vehicle.InsuranceEndDate = policyEvent.EndDate;
                                        await vehicleRepo.UpdateAsync(vehicle, stoppingToken);
                                        _logger.LogInformation("Write DB araç sigorta bitiş tarihi güncellendi: VehicleId: {VehicleId}, EndDate: {EndDate}", vehicle.Id, vehicle.InsuranceEndDate);
                                    }

                                    // 2. Update Read DB
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

                                    // 3. Clear cache
                                    await redisDb.KeyDeleteAsync(GetCacheKeyAll(policyEvent.TenantId));
                                    var plateKey = view != null ? $"vehicle:plate:{view.Plate.ToUpperInvariant()}" : null;
                                    if (plateKey != null) await redisDb.KeyDeleteAsync(plateKey);
                                }
                            }
                            else if (eventType == nameof(PolicyRenewedEvent))
                            {
                                var policyEvent = JsonSerializer.Deserialize<PolicyRenewedEvent>(consumeResult.Message.Value);
                                if (policyEvent != null)
                                {
                                    // 1. Update Write DB
                                    var vehicleRepo = scope.ServiceProvider.GetRequiredService<IVehicleRepository>();
                                    var vehicle = await vehicleRepo.GetByIdAsync(policyEvent.VehicleId, stoppingToken);
                                    if (vehicle != null)
                                    {
                                        vehicle.InsuranceEndDate = policyEvent.EndDate;
                                        await vehicleRepo.UpdateAsync(vehicle, stoppingToken);
                                        _logger.LogInformation("Write DB araç sigorta bitiş tarihi yenilendi: VehicleId: {VehicleId}, EndDate: {EndDate}", vehicle.Id, vehicle.InsuranceEndDate);
                                    }

                                    // 2. Update Read DB
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

                                    // 3. Clear cache
                                    await redisDb.KeyDeleteAsync(GetCacheKeyAll(policyEvent.TenantId));
                                    var plateKey = view != null ? $"vehicle:plate:{view.Plate.ToUpperInvariant()}" : null;
                                    if (plateKey != null) await redisDb.KeyDeleteAsync(plateKey);
                                }
                            }
                        });
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
