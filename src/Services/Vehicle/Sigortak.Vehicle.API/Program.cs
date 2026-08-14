using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Serilog;
using Sigortak.CQRS.Behaviors;
using Sigortak.EventBus;
using Sigortak.Vehicle.Domain.Interfaces;
using Sigortak.Vehicle.Infrastructure.Persistence;
using Sigortak.Vehicle.Application.Commands.CreateVehicle;
using Sigortak.Vehicle.Application.Consumers;
using Sigortak.Vehicle.Application.Interfaces;
using StackExchange.Redis;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}{NewLine}  {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
    {
    Log.Information("Sigortak Vehicle API başlatılıyor...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    // ========================================
    // Servis Kayıtları
    // ========================================

    // PostgreSQL (Write DB)
    builder.Services.AddDbContext<VehicleDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("WriteDb"),
            npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(VehicleDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
            })
            .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning)));

    // PostgreSQL (Read DB)
    builder.Services.AddDbContext<ReadDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("ReadDb"),
            npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(ReadDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
            })
            .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning)));

    // Repository'ler
    builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
    builder.Services.AddScoped<Sigortak.Vehicle.Domain.Interfaces.IVehiclePolicyReadRepository, Sigortak.Vehicle.Infrastructure.Persistence.VehiclePolicyReadRepository>();

    // Storage (Only needed if vehicle service directly uploads, but it was used for policies. Let's remove IPolicyStorageService registration)

    // Notifications
    builder.Services.AddScoped<ISmsService, Sigortak.Vehicle.Infrastructure.Notifications.MockSmsService>();
    builder.Services.AddScoped<INotificationService, Sigortak.Vehicle.Infrastructure.Notifications.MockFcmService>();

    // Redis (Read DB)
    var redisConnStr = builder.Configuration["Redis:ConnectionString"] ?? "localhost:6379,password=SigortakRedis2026!";
    builder.Services.AddSingleton<IConnectionMultiplexer>(sp => 
        ConnectionMultiplexer.Connect(redisConnStr));

    // MediatR + CQRS
    builder.Services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssemblyContaining<CreateVehicleCommand>();
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    });

    // FluentValidation
    builder.Services.AddValidatorsFromAssemblyContaining<CreateVehicleCommand>();

    // RabbitMQ EventBus
    builder.Services.AddRabbitMqEventBus(settings =>
    {
        settings.HostName = builder.Configuration["RabbitMq:HostName"] ?? "localhost";
        settings.Port = int.Parse(builder.Configuration["RabbitMq:Port"] ?? "5672");
        settings.UserName = builder.Configuration["RabbitMq:UserName"] ?? "sigortak";
        settings.Password = builder.Configuration["RabbitMq:Password"] ?? "SigortakRabbit2026!";
        settings.VirtualHost = builder.Configuration["RabbitMq:VirtualHost"] ?? "sigortak";
        settings.ExchangeName = "sigortak.vehicle.exchange";
    });

    // Kafka EventBus
    builder.Services.AddKafkaEventBus(settings =>
    {
        settings.BootstrapServers = builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
        settings.DefaultTopic = "vehicle-events";
    });

    // Background Consumers (RabbitMQ & Kafka)
    builder.Services.AddHostedService<CreateVehicleCommandConsumer>();
    builder.Services.AddHostedService<VehicleEventsConsumer>();
    builder.Services.AddHostedService<NotificationConsumer>();

    // Health Checks
    builder.Services.AddHealthChecks()
        .AddNpgSql(builder.Configuration.GetConnectionString("WriteDb")!)
        .AddRedis(redisConnStr)
        .AddRabbitMQ(setup => setup.ConnectionUri = new Uri($"amqp://{builder.Configuration["RabbitMq:UserName"]}:{builder.Configuration["RabbitMq:Password"]}@{builder.Configuration["RabbitMq:HostName"]}:{builder.Configuration["RabbitMq:Port"]}/{builder.Configuration["RabbitMq:VirtualHost"]}"))
        .AddKafka(setup => setup.BootstrapServers = builder.Configuration["Kafka:BootstrapServers"]!);

    // Controllers
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter());
        });

    // Swagger
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Sigortak Vehicle API",
            Version = "v1",
            Description = "Araba Sigorta Takip Sistemi — Araç Yönetim Servisi"
        });
    });

    // CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    // ========================================
    // Pipeline
    // ========================================
    var app = builder.Build();

    // Migrate on startup (development only)
    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<VehicleDbContext>();
        await dbContext.Database.MigrateAsync();

        var readDbContext = scope.ServiceProvider.GetRequiredService<ReadDbContext>();
        await readDbContext.Database.EnsureCreatedAsync();

        // Sync read database with write database if empty
        if (!await readDbContext.VehiclePolicies.AnyAsync())
        {
            var vehiclesList = await dbContext.Vehicles.ToListAsync();

            foreach (var v in vehiclesList)
            {
                var view = new Sigortak.Vehicle.Domain.Entities.VehiclePolicyView
                {
                    VehicleId = v.Id,
                    Plate = v.Plate,
                    Brand = v.Brand,
                    Model = v.Model,
                    Year = v.Year,
                    BodyType = v.BodyType.ToString(),
                    EngineCapacity = v.EngineCapacity,
                    ChassisNumber = v.ChassisNumber,
                    RegistrationNumber = v.RegistrationNumber,
                    OwnerId = v.OwnerId,
                    OwnerName = v.OwnerName,
                    OwnerTcNo = v.OwnerTcNo,
                    OwnerAddress = v.OwnerAddress,
                    UsageType = v.UsageType,
                    TrafficRegistrationDate = v.TrafficRegistrationDate,
                    InspectionDate = v.InspectionDate,
                    PolicyId = null,
                    PolicyNumber = null,
                    SbmPolicyNumber = null,
                    StartDate = null,
                    EndDate = null,
                    Premium = null,
                    DocumentUrl = null,
                    PolicyIsActive = null,
                    UpdatedAt = DateTime.UtcNow
                };
                readDbContext.VehiclePolicies.Add(view);
            }
            await readDbContext.SaveChangesAsync();
        }

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sigortak Vehicle API v1");
            c.RoutePrefix = string.Empty; // Swagger'ı root'ta aç
        });
    }

    app.UseCors("AllowAll");
    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("Sigortak Vehicle API başlatıldı — Port: {Urls}", app.Urls);
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Uygulama başlatılamadı!");
}
finally
{
    await Log.CloseAndFlushAsync();
}
