using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
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

        var eventName = nameof(CreateVehicleCommand);
        _queueName = $"sigortak.{eventName.ToLowerInvariant()}.queue";

        _channel.QueueDeclare(
            queue: _queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null);

        _channel.QueueBind(_queueName, _settings.ExchangeName, eventName);
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        stoppingToken.ThrowIfCancellationRequested();

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += async (ch, ea) =>
        {
            var content = Encoding.UTF8.GetString(ea.Body.ToArray());
            var command = JsonSerializer.Deserialize<CreateVehicleCommand>(content);

            if (command != null)
            {
                _logger.LogInformation("CreateVehicleCommand alındı plaka: {Plate}", command.Plate);

                using var scope = _serviceProvider.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<IVehicleRepository>();
                var kafkaEventBus = scope.ServiceProvider.GetRequiredService<KafkaEventBus>();

                // Plaka kontrolü
                var exists = await repository.ExistsByPlateAsync(command.Plate, stoppingToken);
                if (!exists)
                {
                    var vehicle = new Domain.Entities.Vehicle
                    {
                        Id = command.Id, // Komutun Id'sini kullan
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
                        BodyType = command.BodyType,
                        InspectionDate = command.InspectionDate,
                        InsuranceEndDate = command.InsuranceEndDate,
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
                        vehicle.OwnerId,
                        vehicle.BodyType,
                        vehicle.InspectionDate,
                        vehicle.InsuranceEndDate
                    );

                    await kafkaEventBus.PublishAsync(syncEvent, stoppingToken);
                }
                else
                {
                    _logger.LogWarning("Plaka zaten mevcut: {Plate}, işlem atlandı.", command.Plate);
                }
            }

            _channel.BasicAck(ea.DeliveryTag, false);
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
