using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Polly;
using Sigortak.EventBus.Kafka;
using Sigortak.EventBus.RabbitMq;
using Sigortak.Vehicle.Application.Commands.CreateVehicle;
using Sigortak.Vehicle.Application.Events;
using Sigortak.Vehicle.Domain.Interfaces;

namespace Sigortak.Vehicle.Application.Consumers;

/// <summary>
/// RabbitMQ'dan CreateVehicleCommand dinleyen arka plan servisi.
/// </summary>
public class CreateVehicleCommandConsumer : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CreateVehicleCommandConsumer> _logger;
    private readonly RabbitMqSettings _settings;
    private IConnection _connection = null!;
    private IModel _channel = null!;
    private string _queueName = null!;

    public CreateVehicleCommandConsumer(
        IServiceProvider serviceProvider,
        ILogger<CreateVehicleCommandConsumer> logger,
        RabbitMqSettings settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings;
        InitializeRabbitMq();
    }

    private void InitializeRabbitMq()
    {
        var factory = new ConnectionFactory
        {
            HostName = _settings.HostName,
            Port = _settings.Port,
            UserName = _settings.UserName,
            Password = _settings.Password,
            VirtualHost = _settings.VirtualHost,
            DispatchConsumersAsync = true
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        // Exchange'i tanımla (eğer yoksa oluştursun)
        _channel.ExchangeDeclare(
            exchange: _settings.ExchangeName,
            type: ExchangeType.Topic,
            durable: true);

        // Dead Letter Exchange'i tanımla (eğer yoksa oluştursun)
        var dlxExchangeName = $"{_settings.ExchangeName}.dlx";
        _channel.ExchangeDeclare(
            exchange: dlxExchangeName,
            type: ExchangeType.Topic,
            durable: true);

        var eventName = nameof(CreateVehicleCommand);
        _queueName = $"sigortak.{eventName.ToLowerInvariant()}.queue";
        var dlqQueueName = $"{_queueName}.dlq";

        // Precondition failed hatasını önlemek için eski kuyruğu silip baştan oluşturuyoruz (DLQ argümanları eklenince çakışma yaşanmasın)
        try
        {
            _channel.QueueDelete(_queueName);
        }
        catch { /* ignored if doesn't exist */ }

        // DLQ kuyruğunu tanımla ve DLX'e bağla
        _channel.QueueDeclare(
            queue: dlqQueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null);
        _channel.QueueBind(dlqQueueName, dlxExchangeName, eventName);

        // Ana kuyruğu DLQ argümanlarıyla tanımla ve ana exchange'e bağla
        var args = new Dictionary<string, object>
        {
            { "x-dead-letter-exchange", dlxExchangeName },
            { "x-dead-letter-routing-key", eventName }
        };

        _channel.QueueDeclare(
            queue: _queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: args);

        _channel.QueueBind(_queueName, _settings.ExchangeName, eventName);
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        stoppingToken.ThrowIfCancellationRequested();

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += async (ch, ea) =>
        {
            var content = Encoding.UTF8.GetString(ea.Body.ToArray());
            var deserializeOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            
            try
            {
                var command = JsonSerializer.Deserialize<CreateVehicleCommand>(content, deserializeOptions);

                if (command != null)
                {
                    _logger.LogInformation("CreateVehicleCommand alındı plaka: {Plate}, OwnerName: {OwnerName}", command.Plate, command.OwnerName);

                    // Polly Retry Policy: 3 kez üstel gecikmeyle (2s, 4s, 8s) tekrar dener.
                    await Policy
                        .Handle<Exception>()
                        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), 
                            (exception, timeSpan, retryCount, context) =>
                            {
                                _logger.LogWarning(exception, "CreateVehicleCommand işlenirken hata oluştu. {TimeSpan} sonra tekrar denenecek. (Deneme: {RetryCount}/3)", timeSpan, retryCount);
                            })
                        .ExecuteAsync(async () =>
                        {
                            using var scope = _serviceProvider.CreateScope();
                            var repository = scope.ServiceProvider.GetRequiredService<IVehicleRepository>();
                            var kafkaEventBus = scope.ServiceProvider.GetRequiredService<KafkaEventBus>();

                            // Plaka kontrolü
                            var exists = await repository.ExistsByPlateAsync(command.Plate, stoppingToken);
                            if (!exists)
                            {
                                var vehicle = new Domain.Entities.Vehicle
                                {
                                    Id = command.Id,
                                    Plate = command.Plate.ToUpperInvariant(),
                                    Brand = command.Brand,
                                    Model = command.Model,
                                    Year = command.Year,
                                    EngineNumber = command.EngineNumber,
                                    EngineCapacity = command.EngineCapacity,
                                    ChassisNumber = command.ChassisNumber,
                                    RegistrationNumber = command.RegistrationNumber,
                                    OwnerId = command.OwnerId,
                                    OwnerName = command.OwnerName,
                                    OwnerTcNo = command.OwnerTcNo,
                                    OwnerAddress = command.OwnerAddress,
                                    UsageType = command.UsageType,
                                    TrafficRegistrationDate = command.TrafficRegistrationDate,
                                    BodyType = command.BodyType,
                                    InspectionDate = command.InspectionDate,
                                    InsuranceEndDate = command.InsuranceEndDate,
                                    TenantId = command.TenantId,
                                    IsActive = true
                                };

                                await repository.CreateAsync(vehicle, stoppingToken);
                                _logger.LogInformation("Araç Write DB'ye kaydedildi (ID: {Id})", vehicle.Id);

                                // Kafka'ya olay fırlat
                                var syncEvent = new VehicleCreatedEvent(
                                    vehicle.Id,
                                    vehicle.Plate,
                                    vehicle.Brand,
                                    vehicle.Model,
                                    vehicle.Year,
                                    vehicle.EngineNumber,
                                    vehicle.EngineCapacity,
                                    vehicle.ChassisNumber,
                                    vehicle.RegistrationNumber,
                                    vehicle.OwnerId,
                                    vehicle.OwnerName,
                                    vehicle.OwnerTcNo,
                                    vehicle.OwnerAddress,
                                    vehicle.UsageType,
                                    vehicle.TrafficRegistrationDate,
                                    vehicle.BodyType,
                                    vehicle.InspectionDate,
                                    vehicle.InspectionPassed,
                                    vehicle.InspectionDocumentUrl,
                                    vehicle.InsuranceEndDate
                                );
                                syncEvent.TenantId = command.TenantId;

                                await kafkaEventBus.PublishAsync(syncEvent, stoppingToken);
                            }
                            else
                            {
                                _logger.LogWarning("Plaka zaten mevcut: {Plate}, işlem atlandı.", command.Plate);
                            }
                        });
                }

                _channel.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateVehicleCommand işlenirken kalıcı hata oluştu veya retries tükendi. Mesaj DLQ'ya gönderiliyor. İçerik: {Content}", content);
                
                // requeue = false seçeneği, mesajı ana kuyruktan silip DLQ'ya yönlendirir.
                _channel.BasicNack(ea.DeliveryTag, false, false);
            }
        };

        _channel.BasicConsume(_queueName, false, consumer);
        return Task.CompletedTask;
    }

    public override void Dispose()
    {
        _channel?.Close();
        _connection?.Close();
        base.Dispose();
    }
}
