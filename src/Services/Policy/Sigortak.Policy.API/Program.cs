using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Serilog;
using Sigortak.CQRS.Behaviors;
using Sigortak.EventBus;
using Sigortak.Policy.Domain.Interfaces;
using Sigortak.Policy.Infrastructure.Persistence;
using Sigortak.Policy.Application.Commands.CreatePolicy;
using Sigortak.Policy.Application.Interfaces;
using Sigortak.Policy.Infrastructure.BackgroundServices;
using StackExchange.Redis;

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
    Log.Information("Sigortak Policy API başlatılıyor...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    // ========================================
    // Servis Kayıtları
    // ========================================

    // PostgreSQL (Write DB)
    builder.Services.AddDbContext<PolicyDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("WriteDb"),
            npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(PolicyDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
            })
            .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning)));

    // Repository'ler
    builder.Services.AddScoped<IPolicyRepository, PolicyRepository>();

    // Tenant context
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<Sigortak.Common.ITenantProvider, Sigortak.Policy.API.Services.HttpTenantProvider>();

    // Storage
    builder.Services.AddScoped<IPolicyStorageService, Sigortak.Policy.Infrastructure.Storage.MinioStorageService>();

    // Redis
    var redisConnStr = builder.Configuration["Redis:ConnectionString"] ?? "localhost:6379,password=SigortakRedis2026!";
    builder.Services.AddSingleton<IConnectionMultiplexer>(sp => 
        ConnectionMultiplexer.Connect(redisConnStr));

    // MediatR + CQRS
    builder.Services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssemblyContaining<CreatePolicyCommand>();
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    });

    // FluentValidation
    builder.Services.AddValidatorsFromAssemblyContaining<CreatePolicyCommand>();

    // Kafka EventBus
    builder.Services.AddKafkaEventBus(settings =>
    {
        settings.BootstrapServers = builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
        settings.DefaultTopic = "vehicle-events"; // Publish policy events to vehicle-events for consumer synchronization
    });

    // Background Workers
    builder.Services.AddSingleton<PolicyExpirationWorker>();
    builder.Services.AddHostedService<PolicyExpirationWorker>(sp => sp.GetRequiredService<PolicyExpirationWorker>());

    // Health Checks
    builder.Services.AddHealthChecks()
        .AddNpgSql(builder.Configuration.GetConnectionString("WriteDb")!)
        .AddRedis(redisConnStr)
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
            Title = "Sigortak Policy API",
            Version = "v1",
            Description = "Araba Sigorta Takip Sistemi — Poliçe Yönetim Servisi"
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
        var dbContext = scope.ServiceProvider.GetRequiredService<PolicyDbContext>();
        await dbContext.Database.MigrateAsync();

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sigortak Policy API v1");
            c.RoutePrefix = string.Empty;
        });
    }

    app.UseCors("AllowAll");
    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("Sigortak Policy API başlatıldı — Port: {Urls}", app.Urls);
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
