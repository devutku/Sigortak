using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using Sigortak.CQRS.Behaviors;
using Sigortak.EventBus;
using Sigortak.Identity.API.Middleware;
using Sigortak.Identity.Application.Commands.Register;
using Sigortak.Identity.Infrastructure;
using Sigortak.Identity.Infrastructure.Persistence;

// Serilog yapılandırması
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}{NewLine}  {Message:lj}{NewLine}{Exception}")
    .WriteTo.Seq(Environment.GetEnvironmentVariable("Seq__ServerUrl") ?? "http://localhost:5341")
    .CreateLogger();

try
{
    Log.Information("Sigortak Identity API başlatılıyor...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    // ========================================
    // Servis Kayıtları
    // ========================================

    // Infrastructure (EF Core, JWT, Repositories)
    builder.Services.AddIdentityInfrastructure(builder.Configuration);

    // MediatR + CQRS
    builder.Services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssemblyContaining<RegisterCommand>();
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    });

    // FluentValidation
    builder.Services.AddValidatorsFromAssemblyContaining<RegisterCommand>();

    // RabbitMQ
    builder.Services.AddRabbitMqEventBus(settings =>
    {
        settings.HostName = builder.Configuration["RabbitMq:HostName"] ?? "localhost";
        settings.Port = int.Parse(builder.Configuration["RabbitMq:Port"] ?? "5672");
        settings.UserName = builder.Configuration["RabbitMq:UserName"] ?? "sigortak";
        settings.Password = builder.Configuration["RabbitMq:Password"] ?? "SigortakRabbit2026!";
        settings.VirtualHost = builder.Configuration["RabbitMq:VirtualHost"] ?? "sigortak";
        settings.ExchangeName = "sigortak.identity.exchange";
    });

    // Kafka
    builder.Services.AddKafkaEventBus(settings =>
    {
        settings.BootstrapServers = builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
        settings.DefaultTopic = "identity-events";
    });

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
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Sigortak Identity API",
            Version = "v1",
            Description = "Araba Sigorta Takip Sistemi — Kimlik Doğrulama ve Yetkilendirme Servisi",
            Contact = new OpenApiContact
            {
                Name = "Sigortak Team",
                Email = "dev@sigortak.dev"
            }
        });

        // JWT Bearer Auth
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "JWT token giriniz. Örnek: eyJhbGciOiJIUz..."
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    // Health Checks
    builder.Services.AddHealthChecks()
        .AddNpgSql(
            builder.Configuration.GetConnectionString("WriteDb")!,
            name: "postgresql-write",
            tags: new[] { "db", "write" })
        .AddRedis(
            builder.Configuration["Redis:ConnectionString"] ?? "localhost:6379,password=SigortakRedis2026!",
            name: "redis",
            tags: new[] { "cache" })
        .AddRabbitMQ(
            new Uri($"amqp://{builder.Configuration["RabbitMq:UserName"] ?? "sigortak"}:{builder.Configuration["RabbitMq:Password"] ?? "SigortakRabbit2026!"}@{builder.Configuration["RabbitMq:HostName"] ?? "localhost"}:{builder.Configuration["RabbitMq:Port"] ?? "5672"}/{builder.Configuration["RabbitMq:VirtualHost"] ?? "sigortak"}"),
            name: "rabbitmq",
            tags: new[] { "messaging" })
        .AddKafka(
            new Confluent.Kafka.ProducerConfig
            {
                BootstrapServers = builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092"
            },
            name: "kafka",
            tags: new[] { "messaging" });

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
        var dbContext = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        await dbContext.Database.MigrateAsync();

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sigortak Identity API v1");
            c.RoutePrefix = string.Empty; // Swagger'ı root'ta aç
        });
    }

    app.UseMiddleware<ExceptionHandlingMiddleware>();

    app.UseCors("AllowAll");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("Sigortak Identity API başlatıldı — Port: {Urls}", app.Urls);
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
